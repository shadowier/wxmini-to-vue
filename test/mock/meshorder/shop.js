Page({

  /**
   * 页面的初始数据
   */
  data: {
    "shopList": [],
    type: 0, // 0 为原来的 、1为人流统计
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      type: options && options.type || 0
    })

    wx.setStorageSync("changedBranchId", null);
    var customerId = wx.getStorageSync('customerId');

    var that = this;

    wx.request({
      url: "https://binguoai.com/api/wxapp/shop/meshorder/shopList",
      method: "POST",
      data: {
        customerId: customerId
      },
      success: function(res) {
        res = res.data;

        if (res.code == 200) {

          if (res.data.length > 1) {
            wx.setNavigationBarTitle({
              title: "选择商户"
            });
            that.setData({
              shopList: res.data
            })
          } else {
            wx.setStorageSync("meshOrderShopId", res.data[0].shopId);
            // wx.redirectTo({
            //   url: '/pages/meshorder/index',
            // })
            that.toMeshOrderPage({
              currentTarget: {
                dataset: {
                  shopid: res.data[0].shopId,
                  name: res.data[0].shopName
                }
              }
            }, true);
          }

        } else {
          wx.showToast({
            title: '暂无可预订',
            icon: 'none',
            duration: 1000,
            mask: true
          });
        }
      }
    });


  },

  onShow: function(e) {
    wx.setStorageSync("changedBranchId", null);
  },

  toMeshOrderPage: function(e, status) {
    const type = this.data.type;
    var shopid = e.currentTarget.dataset.shopid;
    var name = e.currentTarget.dataset.name;

    console.log("meshOrderShopId====" + shopid);

    wx.setStorageSync("meshOrderShopId", shopid);
    wx.setStorageSync("meshOrderShopName", name);

    if (type == 0) {
      wx.redirectTo({
        url: '/pages/meshorder/index',
      })
    } else if (type == 1) {

      if (status) {
        // face
        wx.redirectTo({
          url: '/ypchart/trafficStatistics/index',
        });
      } else {
        // face
        wx.navigateTo({
          url: '/ypchart/trafficStatistics/index',
        });
      }
    }
  }

})