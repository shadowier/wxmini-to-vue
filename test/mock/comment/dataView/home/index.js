// pages/comment/dataView/home/index.js

/**
  "van-button": "../../../../assets/vant/button/index",
  "van-cell": "../../../../assets/vant/cell/index",
  "van-cell-group": "../../../../assets/vant/cell-group/index"
 */


const YpRequest = require('../../../../lib/ypRequest');
const utils = require('../../../../lib/utils');
const domain = 'https://tc.yunpengai.com';
Page({

  data: {
    branchId: "",
    branchName: "",
    merchantShopId: "",

    tabIndex: 0, // 用于控制类型（0:订单、1:菜品）

    orderItemIndex: 0, // 查看的类型
    orderItemCode: "001", // 查看的类型
    foodItemIndex: 0, // 查看的类型
    foodItemCode: "003", // 查看的类型
    orderIsTopTen: true,
    foodIsTopTen: true,

    foodlist: [], // 菜品列表
    foodIndex: -1,

    orderTime: utils.Formatter.format(new Date(), 'YYYY-MM'),
    foodTime: utils.Formatter.format(new Date(), 'YYYY-MM'),

    orderCommentItemEntity: [],
    foodCommentItemEntity: [],

    showOrderCommentList: [],
    showFoodCommentList: [],


    // --- 其他控件
    showDatetimePicker: false,
    currentDate: new Date().getTime(),
    maxDate: new Date().getTime()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('onLoad init');
    this.initPage();
    this.loadCommentEntityData().then(res => {
      this.loadOrderCommentData();
    }).catch(err => {
      console.log(err);
    });
    this.loadFoodListData();
  },
  initPage() {
    this.loadLocalStore();
    wx.setNavigationBarTitle({
      title: this.data.branchName + '-评论数据',
    });
  },
  /**
   * 加载实体数据
   */
  loadCommentEntityData() {
    // /comment/record/getCommentItem
    wx.showLoading({
      title: '加载中',
    });
    return new Promise((resolve, reject) => {
      const entity001 = YpRequest.post(domain + '/comment/record/getCommentItem', {
        "entityCode": "001"
      });
      const entity002 = YpRequest.post(domain + '/comment/record/getCommentItem', {
        "entityCode": "002"
      });

      Promise.all([entity001, entity002]).then(resList => {
        const keys = ['orderCommentItemEntity', 'foodCommentItemEntity'];
        const resData = {};

        resList.map((res, index) => {
          resData[keys[index]] = res.items;
        });

        this.setData(resData);
        wx.hideLoading();
        resolve();

      }).catch(err => {
        reject();
        wx.hideLoading();
      });
    })
  },
  /**
   * 加载订单评价
   */
  loadOrderCommentData() {
    console.log('loadOrderCommentData init');
    const {
      branchId,
      merchantShopId,
      orderItemCode,
      orderIsTopTen,
      orderTime
    } = this.data;
    this.setData({
      showOrderCommentList: [],
    });
    wx.showLoading({
      title: '加载中',
    });
    return YpRequest.post(domain + '/comment/dataView/topTenByMonth', {
      "bizId": {
        "1_merchantId": merchantShopId,
        "2_branchId": branchId,
      },
      "entityCode": "001",
      "itemCode": orderItemCode,
      "queryDate": orderTime + '-01',
      "isTopTen": orderIsTopTen
    }).then(res => {
      if (!res || !res.length) {
        wx.showToast({
          title: '无数据',
          icon: 'none'
        })
        return;
      }
      this.setData({
        showOrderCommentList: res,
      });
      wx.hideLoading();
    }).catch(err => {
      wx.hideLoading();
    });
  },

  /**
   * 获取商品列表
   */
  loadFoodListData() {
    const {
      branchId,
      merchantShopId,
      foodItemCode,
      foodIsTopTen,
      foodTime
    } = this.data;
    wx.showLoading({
      title: '加载中',
    });
    // https://binguoai.com/api/wxapp/meshProduct/list
    // https://binguoai.com/api/wxapp/product/list?shopId=23&branchId=9

    return new Promise((resolve, reject) => {
      const p1 = YpRequest.get('/api/wxapp/meshProduct/list?shopId=' + merchantShopId + '&branchId=' + branchId);
      const p2 = YpRequest.get('/api/wxapp/product/list?shopId=' + merchantShopId + '&branchId=' + branchId);

      Promise.all([p1, p2]).then((resList) => {
        const keys = ['在线', '餐台'];
        let foodlist = [];
        resList.map((list, index) => {

          list = list.map(item => {
            item.name = item.name + '-' + keys[index]
            return item;
          });

          foodlist = foodlist.concat(list);

        });
        resolve();
        this.setData({
          foodlist: foodlist
        });
        wx.hideLoading();
      }).catch(err => {
        wx.hideLoading();
        reject();
      })

    })
  },

  /**
   * 获取当个商品的评价
   * @param {*} productId 商品id
   */
  loadFoodCommentData() {
    console.log('loadOrderCommentData init');
    const {
      branchId,
      merchantShopId,
      foodItemCode,
      foodIsTopTen,
      foodTime,
      foodIndex
    } = this.data;
    if (parseInt(foodIndex) < 0) return;
    const productId = this.data.foodlist[foodIndex].id;

    this.setData({
      showFoodCommentList: []
    });
    wx.showLoading({
      title: '加载中',
    });
    return YpRequest.post(domain + '/comment/dataView/topTenByMonth', {
      "bizId": {
        "1_merchantId": merchantShopId,
        "2_branchId": branchId,
        "3_orderNo": "%",
        "4_productId": productId
      },
      "entityCode": "002",
      "itemCode": foodItemCode,
      "queryDate": foodTime + '-01',
      "isTopTen": foodIsTopTen
    }).then(res => {
      if (!res || !res.length) {
        wx.showToast({
          title: '无数据',
          icon: 'none'
        })
        return;
      }
      this.setData({
        showFoodCommentList: res,
      });
      wx.hideLoading();
    }).catch(err => {
      wx.hideLoading();
    });
  },

  /**
   * 加载本地数据
   */
  loadLocalStore() {
    const branchId = wx.getStorageSync('branchId');
    const branchName = wx.getStorageSync('branchName');
    const merchantShopId = wx.getStorageSync('merchantShopId');

    this.setData({
      branchName,
      branchId,
      merchantShopId
    })
  },

  // ----- 页面逻辑

  onChangeTab(e) {

    this.setData({
      tabIndex: e.detail.index
    });

  },
  onChangeItemCode(e) {
    const keyMap = {
      order: {
        list: this.data.orderCommentItemEntity,
        codeKey: 'orderItemCode',
        indexKey: 'orderItemIndex',
        fn: this.loadOrderCommentData
      },
      food: {
        list: this.data.foodCommentItemEntity,
        codeKey: 'foodItemCode',
        indexKey: 'foodItemIndex',
        fn: this.loadFoodCommentData
      }
    };
    const key = e.currentTarget.dataset.key;
    const index = e.detail.value;

    console.log(key, index);

    const currentData = keyMap[key];
    const item = currentData.list[index];

    console.log('item', item);

    const data = {};
    data[currentData.codeKey] = item.code;
    data[currentData.indexKey] = index;

    this.setData(data);
    // loadFoodCommentData
    // this.loadOrderCommentData();
    currentData.fn.call(this);
  },
  handleChangeTime(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({
      showDatetimePicker: true,
      currentTimeKey: key
    });
  },
  onCloseDatetimePicker() {
    this.setData({
      showDatetimePicker: false,
    });
  },
  onConfirmDate(e) {
    const key = this.data.currentTimeKey;
    console.log('key', key);
    const date = utils.Formatter.format(e.detail, 'YYYY-MM');
    const data = {};
    data[key] = date;
    this.setData(data);
    this.onCloseDatetimePicker();

    if (/^order/.test(key)) {
      this.loadOrderCommentData();
    } else {
      this.loadFoodCommentData();
    }

  },
  handleChangeTopTen(e) {
    const key = e.currentTarget.dataset.key;
    // order
    const is = !!e.detail.value.length;

    const keyMap = {
      order: 'orderIsTopTen',
      food: 'foodIsTopTen'
    }

    const data = {}
    data[keyMap[key]] = is;

    this.setData(data);

    if (/^order/.test(key)) {
      this.loadOrderCommentData();
    } else {
      this.loadFoodCommentData();
    }
    // this.loadOrderCommentData();
  },
  onFoodPickerChange(e) {
    const index = parseInt(e.detail.value);
    if (index < 0) return;

    this.setData({
      foodIndex: index
    });

    this.loadFoodCommentData();
  }
})