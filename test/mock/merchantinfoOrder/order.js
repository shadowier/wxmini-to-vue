var _utils = require('./../../lib/utils.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchValue: '',
    lastOrderNo: '',
    valueT: 2,  // 下拉菜单 option1中选中的value值
    option1: [
      {
        text: '全部订单',
        value: 2
      }, 
      {
        text: '餐柜订单',
        value: 1
      }, 
      {
        text: '非餐柜订单',
        value: 0
      }, 
    ],
    orders: [],
    
    payType: {
      0: '手机支付',
      1: '免密支付',
      2: '刷卡支付',
      3: '线下支付'
    },
    payTypeStyle: {
      0: 'theme-phone',
      1: 'theme-nopwd',
      2: 'theme-card',
      3: 'theme-shop'
    },
    isover: false,
    isBack: false, // true代表从上一级返回
    isSideBoard: false
  },

  // 点击下拉选中搜索条件
  change(e) {
    this.setData({
      valueT: e.detail,
      orders: [],
      isover: false,
      isBack: false
    })
      this.getOrderList(true)
  },

  // 搜索框绑定值变化事件
  changeInput(e) {
    this.setData({
      searchValue: e.detail
    })
    if(this.data.searchValue.trim().length === 0) {
      this.isover = false
      this.getOrderList(true)
    }
  },

  // 触发搜索事件
  onSearch() {
    this.setData({
      lastOrderNo: '',
      orders: [],
      isover: false
    })
    this.getOrderList()
  },

  // 清空搜索输入值
  clear() {
    this.setData({
      searchValue: '',
      isover: false
    })
    this.getOrderList(true)
  },

  // 跳转订单详情页
  toOrderDetail(e) {
    console.log(e.currentTarget.dataset);
    const orderNo = e.currentTarget.dataset.prop;
    const customerId = e.currentTarget.dataset.customer;
    wx.navigateTo({
      url: `/pages/merchantinfoOrder/order-detail?orderNo=${orderNo}&customerId=${customerId}`,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let branchName = wx.getStorageSync('branchName');
    wx.setNavigationBarTitle({
      title: branchName + "-在线订单"
    });
    this.getSideBoardByShopId()
  },
  
  // 订单列表 refresh代表不传参数的第一次查询
  getOrderList(refresh) {
    const that = this
    const shopId = wx.getStorageSync('merchantShopId')
    const branchId = wx.getStorageSync('branchId')
    let data = {}
    if(this.data.searchValue.trim().length != 0 ) {
      data.searchKey = this.data.searchValue.trim()
    }
    if (this.data.lastOrderNo && !refresh) {
      data.lastOrderNo = this.data.lastOrderNo
    }
    data.isMeal = this.data.valueT
    wx.request({
      // url: `http://192.168.3.71:9091/api/wxapp/order/list/shop/${shopId}/${branchId}`,
      url: `https://binguoai.com/api/wxapp/order/list/shop/${shopId}/${branchId}`,
      // url: `http://123.206.224.209:9091/api/wxapp/order/list/shop/${shopId}/${branchId}`,
      // url: `https://binguoai.com/api/wxapp/order/list/shop/${shopId}/${branchId}`,
      method: 'GET',
      data,
      success: function (res) {
        const {
          data
        } = res.data
        let array = that.data.orders
        if(data.length < 20) {
          that.setData({
            isover: true
          })
        }else {
          that.setData({
            isover: false
          })
        }
        if(refresh) {
          array = []
        }
        data.forEach(function (element) {
          element.fixPrice = (element.realFee / 100).toFixed(2);
          element.formateOrderTime = _utils.Formatter.format(element.payTime, 'YYYY-MM-DD HH:mm');
          // console.log('12',element)
          array.push(element)
        });
        if(data.length != 0) {   
          that.setData({
            orders: array,
            lastOrderNo: data[data.length - 1].orderNo
          })
        }
        
      }
    })
  },

  // 查询该分店下是否已经绑定智能餐柜
  getSideBoardByShopId() {
    const that = this
    const shopId = wx.getStorageSync('merchantShopId')
    const branchId = wx.getStorageSync('branchId')
    wx.request({
      url: `https://binguoai.com/api/wxapp/aiyouwei/getSideBoardByShopIdAndBranchId/${shopId}/${branchId}`,
      // url: `http://192.168.3.71:9091/api/wxapp/aiyouwei/getSideBoardByShopIdAndBranchId/${shopId}/${branchId}`,
      method: 'GET',
      success: function (res) {
        const { data } = res
        if(data.code != 200) {
          that.setData({
            isSideBoard: false   // 记得改回false
          })
          return
        }
        that.setData({
          isSideBoard: true
        })
      }
    })
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if(!this.data.isBack) {
      this.getOrderList(true)
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   * 下拉刷新
   */
  onPullDownRefresh: function() {
    console.log('onPullDownRefresh')
    this.setData({
      // orders: [],
      searchValue: '',
      lastOrderNo: '',
      orders: []
    })
 
      this.getOrderList()
   
    wx.hideNavigationBarLoading()
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   * 上拉加载订单
   */
  onReachBottom: function() {
      this.getOrderList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})