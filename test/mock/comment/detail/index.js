// pages/comment/detail/index.js
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
    oid: "",
    orderComment: [],
    orderData: null,
    orderItemComment: [],
    isComment: true,
    showCommeentDialog: false,
    commentValue: "",
    currentItem: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const oid = options.oid;
    const shop = options.shop;
    this.data.oid = oid;
    this.data.shop = shop;
    // 
    const orderData = wx.getStorageSync('o_' + oid);
    this.setData({
      orderData: orderData,
    });
    this.init();
  },
  init() {
    wx.showLoading({
      title: '加载中',
      mask: true,
    });
    const oid = this.data.oid;
    const orderData = this.data.orderData;
    this.loadData('001', oid);
    this.loadOrderItem(orderData.orderItems);
  },
  loadOrderItem(orderItems) {

    this.data.orderItemComment = [];
    const promiseList = (orderItems || []).map(item => {
      const productId = item.productId;
      return this.loadData('002', productId, item);
    });
    Promise.all(promiseList).then(item => {
      wx.hideLoading();
      console.log('item', item);
    }).catch(err => {
      wx.hideLoading();
      console.log('err', err);
    });
  },
  getOrderaItemByProductId(productId) {

    if (!this.data.orderData || !this.data.orderData.orderItems) return {};
    return this.data.orderData.orderItems.find(item => {
      return item.productId == productId;
    })
  },
  loadData(entityCode, oid, oItem = {}) {
    const orderData = this.data.orderData;
    console.log('orderData', orderData)
    const orderBizData = {
      '001': {
        "1_merchantId": orderData.shopId,
        "2_branchId": orderData.branchId || 9, // TODO: 等字段中
      },
      '002': {
        "1_merchantId": orderData.shopId,
        "2_branchId": orderData.branchId || 9, // TODO: 等字段中
        "3_orderNo": orderData.orderNo,
        "4_productId": oItem.productId,
      }
    };
    console.log('orderBizData[entityCode]', orderBizData[entityCode]);

    YpRequest.post('https://tc.yunpengai.com/comment/record/getCommentRecords', {
      "entityCode": entityCode,
      "entityId": oid,
      bizId: orderBizData[entityCode]
    }).then(res => {
      if (!res || !res.length) {
        wx.showToast({
          title: '未评论',
          icon: "none",
          duration: 2500
        });
        return;
      }
      const orderComment = (res || []).map(item => {
        return Object.assign({}, item, {
          name: item.itemName || "无名称",
          score: item.score || 0,
          content: item.content || '',
          files: item.files || [],
        });
      });
      const data = {};
      if (entityCode == '001') {
        data.orderComment = orderComment;
      } else if (entityCode == '002') {
        const orderItem = this.getOrderaItemByProductId(oid);

        const orderItemComment = this.data.orderItemComment;
        orderItemComment.push({
          orderComment,
          orderItem
        });
        data.orderItemComment = orderItemComment;
      }
      this.setData(data);
    }).catch(e => {
      console.log(e);
    })
  },
  handleCommentItem(e) {
    const item = e.currentTarget.dataset.item;
    const isShop = !!this.data.shop;
    if (item.appendContent) {
      if (isShop && item.appendContent.merchantComment) {
        return;
      } else if (!isShop && item.appendContent.userComment) {
        return;
      }
    }

    this.setData({
      currentItem: item,
      commentValue: "",
      showCommeentDialog: true
    });
  },
  handleChangeInput(e) {
    this.data.commentValue = e.detail.value;
  },
  handleCancel(e) {
    console.log('e', e);
    e.detail.dialog.close();
    this.setData({
      showCommeentDialog: false,
    });
  },
  handleConfirmComment(e) {

    const commentValue = this.data.commentValue;

    if (!commentValue) {
      wx.showToast({
        title: '内容不能为空',
        icon: 'none'
      });
      e.detail.dialog.stopLoading();
      return;
    }
    const currentItem = this.data.currentItem;
    console.log('currentItem', currentItem);
    const reqData = {
      "appendItemId": currentItem.id,
      "appendUser": currentItem.commentUser,
      "isCustomerComment": true,
      "appendContent": currentItem.appendContent || {}
    };

    if (currentItem.entityCode == '002') {
      const orderData = this.data.orderData;
      reqData.bizId = {
        "1_merchantId": orderData.shopId,
        "2_branchId": orderData.branchId || 9, // TODO: 等字段中
        "3_orderNo": orderData.orderNo,
        "4_productId": currentItem.entityId,
      };
    }

    const shop = this.data.shop;
    if (shop) {
      reqData.isCustomerComment = false;
      reqData.appendUser = shop;
      reqData.appendContent.merchantComment = commentValue;
    } else {
      reqData.appendContent.userComment = commentValue;
    }

    YpRequest.post('https://tc.yunpengai.com/comment/record/appendComment', reqData).then(res => {
      console.log('res', res);
      this.setData({
        showCommeentDialog: false,
      });
      wx.showToast({
        title: '评论成功',
        icon: 'success'
      });

      e.detail.dialog.stopLoading();
      this.init();
    }).catch(e => {
      e.detail.dialog.stopLoading();
      console.log('e', e);
      wx.showToast({
        title: e.message || '失败',
        icon: 'none'
      });
    })
  },
})