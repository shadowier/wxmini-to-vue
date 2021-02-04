// pages/bindshop/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopId: "",
    "showUserBtn": false,
    "tempClass": "tempShow",
    "pageUrl": "",
    "showDialog": true,
    "telphone": "",
    "verify": "",
    "getHeader": true,
    "needPostUserInfo": true,
    "agreementClass": "agreementPhone",
    "agree": false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    const shopId = options.shopId;
    wx.setNavigationBarTitle({
      title: '绑定设备',
    });
    if (!shopId) {
      wx.showToast({
        title: '参数错误',
      });
      return;
    }
    this.setData({
      shopId: shopId
    });
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

  },


  checkboxChange: function (e) {
    console.log("checkboxChange:" + e);
    this.setData({
      "agree": !this.data.agree
    });
  },
  toggleDialog(){
    console.log(123);
    return false;
  },
  handeNoagree(){
    wx.showToast({
      icon:'none',
      title: '请阅读并同意《服务协议》',
    });
  },

  onPhoneNumber: function (e) {
    console.log(e.detail);
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
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})