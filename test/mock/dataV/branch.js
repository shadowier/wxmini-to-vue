Page({

  /**
   * 页面的初始数据
   */
  data: {
    "branchList": [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "分店列表"
    });
    var that = this;

    var branchList = wx.getStorageSync('branchList');

    that.setData({
      branchList: branchList
    })

  },


  toProductListPage: function (e) {
    var branchId = e.currentTarget.dataset.branchid;
    var branchname = e.currentTarget.dataset.branchname;

    console.log("branchid====" + branchId);

    wx.setStorageSync("branchId", branchId);
    wx.setStorageSync("branchName", branchname);
    wx.navigateTo({
      url: '/pages/dataV/detail',
    })

  }

})
