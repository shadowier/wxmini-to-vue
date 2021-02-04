// pages/comment/comment/index.js
const YpRequest = require('../../../lib/ypRequest');
const {
  randomInt,
  Formatter
} = require('../../../lib/utils');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 订单
    showViewData: {},
    commentItems: [],

    fileList: {},
    // 菜品
    orderItems: [],
    orderItemShowViewData: {},
    orderItemCommentItems: {},

    oid: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const oid = options.oid;
    this.data.oid = oid;
    this.loadData("001");
    this.loadData("002");
    this.loadOrderData();
  },
  loadOrderData() {

    const oid = this.data.oid;
    const orderData = wx.getStorageSync('o_' + oid);
    const orderItems = orderData.orderItems || [];
    console.log('orderItems', orderItems);

    this.setData({
      orderItems
    });
  },
  loadData(entityCode) {
    wx.showLoading({
      title: '加载中',
      mask: true,
    });
    const keys = {
      '001': "showViewData",
      '002': "orderItemShowViewData",
    }
    YpRequest.post('https://tc.yunpengai.com/comment/record/getCommentItem', {
      "entityCode": entityCode
    }).then(res => {
      console.log(res);
      const UpdateData = {};
      UpdateData[keys[entityCode]] = res;
      // this.showViewData = res;
      this.setData(UpdateData);
      wx.hideLoading();
    }).catch(e => {
      console.log(e);
      wx.hideLoading();
    });
  },

  getItemByEventDataset(event) {
    const item = event.currentTarget.dataset.item;
    return item;
  },
  getCodeByEventDataset(event) {
    const code = this.getItemByEventDataset(event).code;
    return code;
  },
  getCommentItemByCode(code) {
    const commentItems = this.data.commentItems;
    let item = commentItems.find(item => item.code == code);
    if (!item) {
      item = {
        code,
      };
      commentItems.push(item);
    }
    return item;
  },
  getOrderCommentItemByCode(id, code) {
    const commentItems = this.data.orderItemCommentItems[id] || [];
    this.data.orderItemCommentItems[id] = commentItems;

    let item = commentItems.find(item => item.code == code);
    if (!item) {
      item = {
        code,
      };
      commentItems.push(item);
    }
    return item;
  },
  fileListRemoveItemByIndex(code, index) {
    const fileList = this.data.fileList;
    const currentFileList = fileList[code] = fileList[code] || [];
    currentFileList.splice(index, 1);
    this.setData({
      fileList: fileList
    });
  },
  updateFileListAndFileStatusByRandomItem(code, file) {
    const id = file.id;
    const fileList = this.data.fileList;
    const currentFileList = fileList[code] = fileList[code] || [];
    const itemIndex = currentFileList.findIndex(item => item.id === id);
    if (itemIndex < 0) {
      currentFileList.push(file);
    } else {
      currentFileList.splice(itemIndex, 1, file);
    }
    console.log('fileList', fileList);

    this.setData({
      fileList: fileList
    });
  },
  getUploadSuccessFiles(code) {
    const fileList = this.data.fileList;
    const currentFileList = fileList[code] = fileList[code] || [];
    return currentFileList.filter(item => item.status == 'done').map(item => item.url);
  },
  onRateChange(e) {
    console.log('e', e);
    const code = this.getCodeByEventDataset(e);
    const item = this.getCommentItemByCode(code);
    item.score = e.detail;
  },
  handleTextareaChange(e) {
    console.log('e', e);
    const code = this.getCodeByEventDataset(e);
    const item = this.getCommentItemByCode(code);
    item.content = e.detail.value;
  },
  onChangeItem(e) {
    console.log('e', e);
    const eDetail = e.detail;
    const _item = e.detail.target;
    const item = this.getCommentItemByCode(_item.code);

    const handleType = {
      files: this.handleChangeFiles,
      score: this.handleChangeScore,
      content: this.handleChangeContent,
    };
    console.log('[eDetail.type]', eDetail.type);

    handleType[eDetail.type] && handleType[eDetail.type].call(this, item, eDetail.value);
  },

  onChangeOrderItem(e) {
    console.log(e);
    const eDetail = e.detail;
    const _item = e.detail.target;
    const id = e.currentTarget.dataset.id;
    const item = this.getOrderCommentItemByCode(id, _item.code);

    const handleType = {
      files: this.handleChangeFiles,
      score: this.handleChangeScore,
      content: this.handleChangeContent,
    };
    console.log('[eDetail.type]', eDetail.type);

    handleType[eDetail.type] && handleType[eDetail.type].call(this, item, eDetail.value);
  },


  handleChangeFiles(item, value) {
    item.files = value.filter(item => item.status == 'done').map(item => item.url);
  },
  handleChangeScore(item, value) {
    item.score = value;
  },
  handleChangeContent(item, value) {
    item.content = value;
  },

  onDeleteFile(e) {
    console.log('e', e);
    const index = e.detail.index;
    const code = this.getCodeByEventDataset(e);
    const item = this.getCommentItemByCode(code);
    this.fileListRemoveItemByIndex(code, index);
    item.files = this.getUploadSuccessFiles(code); // 更新图片列表
  },
  onAfterRead(e) {
    console.log('e', e);
    const code = this.getCodeByEventDataset(e);
    const item = this.getCommentItemByCode(code);
    console.log('e.detail.file.path', e.detail.file.path);
    const path = e.detail.file.path;
    const fileObj = {
      id: randomInt(100000, 999999),
      url: path,
      status: 'uploading',
      message: '上传中',
    };
    wx.showLoading({
      title: '上传中',
      mask: true,
    });
    this.updateFileListAndFileStatusByRandomItem(code, fileObj);
    // TODO: 这里有点乱
    YpRequest.uploadFileQbox(path).then(res => {
      console.log(res);
      fileObj.status = "done";
      fileObj.message = "上传成功";
      fileObj.url = res;
      this.updateFileListAndFileStatusByRandomItem(code, fileObj);
      item.files = this.getUploadSuccessFiles(code); // 更新图片列表
      wx.hideLoading();
    }).catch(e => {
      fileObj.status = "failed";
      fileObj.message = "上传失败";
      this.updateFileListAndFileStatusByRandomItem(code, fileObj);
      wx.hideLoading();
    });
  },
  handleSubmit() {
    console.log('this.data.commentItems', this.data.commentItems);
    console.log('this.data.orderItemCommentItems', this.data.orderItemCommentItems);

    const commentItems = this.data.commentItems.map(item => {
      item.commentTime = Formatter.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
      item.itemCode = item.code;
      return item;
    });
    const oid = this.data.oid;
    const orderData = wx.getStorageSync('o_' + oid);
    console.log('orderData', orderData);

    const orderItemCommentItems = this.data.orderItemCommentItems;

    if (!commentItems || !commentItems.length) {
      wx.showToast({
        title: '请评价订单',
        icon: 'none'
      });
      return;
    }

    if (this.data.orderItems.length > 0) {
      if (!Object.keys(orderItemCommentItems).length) {
        wx.showToast({
          title: '请评价菜品',
          icon: 'none'
        });
        return;
      }
    }


    const reqData = [];
    reqData.push({
      "entityCode": "001",
      // "merchantId": orderData.shopId,
      // "branchId": orderData.branchId, // TODO: 等字段中
      bizId: {
        "1_merchantId": orderData.shopId || 23,
        "2_branchId": orderData.branchId || 9, // TODO: 等字段中
      },
      "entityName": orderData.branchName || oid, // TODO: 等字段中
      "entityId": oid,
      "commentUser": orderData.customerId,
      "commentUserName": orderData.customerName,
      commentItems
    });
    Object.keys(orderItemCommentItems).forEach(key => {
      const item = orderItemCommentItems[key].map(_item => {
        _item.itemCode = _item.code;
        _item.commentTime = Formatter.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
        return _item
      });
      const oItem = this.data.orderItems.find(item => key == item.productId);
      
      reqData.push({
        "entityCode": "002",
        // "merchantId": orderData.shopId,
        // "branchId": orderData.branchId, // TODO: 等字段中
        "entityName": oItem.productName, // TODO: 等字段中
        "entityId": key,
        "commentUser": orderData.customerId,
        "commentUserName": orderData.customerName,
        commentItems: item,
        bizId: {
          "1_merchantId": orderData.shopId,
          "2_branchId": orderData.branchId || 9, // TODO: 等字段中
          "3_orderNo": oid,
          "4_productId": oItem.productId,
          // "productName": oItem.productName,
        },
      });
    });


    // YpRequest.post('/comment/record/addNewCommentRecord', reqData);
    wx.showLoading({
      title: '提交中',
      mask: false
    });

    wx.request({
      url: 'https://tc.yunpengai.com/comment/record/batchAddCommentRecord',
      data: reqData,
      method: "POST",
      success(res) {
        console.log(res);
        wx.hideLoading();
        const resDaata = res.data;
        if (resDaata.code != 200) {
          wx.showToast({
            title: resDaata.message || '未知错误',
            icon: "none"
          });
          return;
        }
        wx.showToast({
          title: '提交成功',
          icon: 'success',
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1000);
      },
      fail(e) {
        wx.showToast({
          title: e.message || '未知错误',
          icon: "none"
        });
        wx.hideLoading();
      }
    })
  }

})