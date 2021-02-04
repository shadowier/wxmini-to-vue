Page({

  /**
   * 页面的初始数据
   */
  data: {
    "cashierDeskProduct": 0,
    "onlineMeshProduct": 0,
    "switch1Checked": true,
    "lunchStatus": true,
    "breakfastStatus": true,
    "dinnerStatus": false,
    "breakfastStyle": "open_style",
    "lunchStyle": "close_style",
    "dinnerStyle": "open_style",
    "isdisabled": true,
    reservePayConfig: 0,
    subDb: 0, // 是否显示 今日菜品列表
    isShowSideBoard: false,
    //
    branchList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('+++++++')
    wx.setNavigationBarTitle({
      title: "商户管理"
    });
    var that = this;

    var customerId = wx.getStorageSync('customerId');

    wx.request({
      url: "https://binguoai.com/api/wxapp/getShopInfo",
      // url: "http://192.168.10.131:9090/api/wxapp/getShopInfo",
      method: "POST",
      data: {
        customerId: customerId
      },
      success: function (res) {
        res = res.data;

        if (res.code == 200) {
          wx.setStorageSync('merchantShopId', res.data.shopId);

          that.setData({
            cashierDeskProduct: res.data.cashierDeskProduct,
            onlineMeshProduct: res.data.onlineMeshProduct,
            breakfastStatus: res.data.breakfastStatus,
            lunchStatus: res.data.lunchStatus,
            dinnerStatus: res.data.dinnerStatus,
            switch1Checked: res.data.autoConfig,
            reservePayConfig: res.data.reservePayConfig,
          });
          if (res.data.subDb == 1) {
            that.setData({
              subDb: res.data.subDb
            })
            wx.setStorageSync('subDb', 1)
          }
          if (res.data.autoConfig == 1) {
            that.setData({
              isdisabled: true
            })
          } else {
            that.setData({
              isdisabled: false
            })
          }
        } else {

        }
      }
    });

    this.setStorageBranchList()
    this.getSideBoardByShopId()
  },

  //查询该商户下是否绑定智能取餐柜
  getSideBoardByShopId() {
    const that = this
    const shopId = wx.getStorageSync('merchantShopId')
    wx.request({
      url: `https://binguoai.com/api/wxapp/aiyouwei/getSideBoardByShopId/${shopId}`,
      // url: `https://binguoai.com/api/wxapp/aiyouwei/getSideBoardByShopId/${shopId}`,
      method: 'GET',
      success: function (res) {
        const data = res.data
        if (data.code == 200) {
          console.log('isShowSideBoard=>true');
          that.setData({
            isShowSideBoard: true
          })
        }
      }
    })
  },
  toWxapp() {
    wx.navigateToMiniProgram({
      appId: 'wx34cdf891381ba921',
      path: 'pages/home/home'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  setStorageBranchList() {
    var that = this;
    var shopId = wx.getStorageSync('merchantShopId');

    wx.request({
      url: "https://binguoai.com/api/wxapp/getBranchList",
      method: "POST",
      data: {
        shopId: shopId
      },
      success: function (res) {
        res = res.data;

        if (res.code == 200) {
          that.setData({
            branchList: res.data
          })
          if (res.data.length > 1) {
            wx.setStorageSync("branchList", res.data);

          } else {
            wx.setStorageSync("branchList", res.data);
            wx.setStorageSync("branchId", res.data[0].branchId);
            wx.setStorageSync("branchName", res.data[0].branchName);
            // wx.navigateTo({
            //   url: '/pages/merchant',
            // })
          }

        } else {
          wx.showToast({
            title: '查询失败，请稍后重试',
            icon: 'none',
            duration: 1000,
            mask: true
          });
        }
      }
    });
  },
  toMeshProductManage: function () {
    if (this.data.branchList.length > 1) {
      wx.navigateTo({
        url: '/pages/branch/branch',
      })
    } else {
      wx.navigateTo({
        url: '/pages/shopmeshproduct/shopmeshproduct',
      })
    }

  },

  toMerchant() {

    if (this.data.branchList.length > 1) {
      wx.navigateTo({
        url: '/pages/branchList/branchList',
      })
    } else {
      wx.navigateTo({
        url: '/pages/merchant',
      })
    }
  },

  toTodayMerchant() {
    if (this.data.branchList.length > 1) {
      wx.navigateTo({
        url: '/pages/todayMerchant/branch',
      })
    } else {
      wx.navigateTo({
        url: '/pages/todayMerchant/index',
      })
    }
  },
  tomerchantinfoOrder() {
    if (this.data.branchList.length > 1) {
      wx.navigateTo({
        url: '/pages/merchantinfoOrder/order-branch',
      })
    } else {
      wx.navigateTo({
        url: '/pages/merchantinfoOrder/order',
      })
    }
  },
  tomerDataV() {
    wx.navigateTo({
      url: '/pages/dataV/branch',
    });
  },
  toSideboard() {
    if (this.data.branchList.length > 1) {
      wx.navigateTo({
        url: '/pages/sideboard/board-branch',
      })
    } else {
      wx.navigateTo({
        url: '/pages/sideboard/sideboard',
      })
    }
  },
  toChangePayType() {
    wx.navigateTo({
      url: '/pages/paytype/index?reservePayConfig=' + this.data.reservePayConfig,
    })
  },
  toSeatManage() {
    wx.navigateTo({
      url: '../seatManagement/seatManagement',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  changeMerchant: function () {
    var that = this
    console.log('切换商户')
    var customerId = wx.getStorageSync("customerId");
    wx.request({
      url: "https://binguoai.com/api/wxapp/merchantLogout",
      method: "POST",
      data: {
        customerId: customerId
      },
      success: function (res) {
        res = res.data;
        console.log(res)
        if (res.code == 200) {

          that.toMe()

        } else {}
      }
    });

  },

  toRegiste: function () {
    wx.navigateTo({
      url: '/pages/splashbak/splashbak',
    })
  },
  toMe: function () {
    wx.navigateTo({
      url: '/pages/home/home',
    })
  },

  switch1Change: function (e) {
    console.log("e.detail.value =====" + e.detail.value);

    if (e.detail.value == true) {
      console.log("isdisabled ===== true");
      this.setData({
        isdisabled: true,
        switch1Checked: true
      })
    } else {
      console.log("isdisabled ===== false");
      this.setData({
        isdisabled: false,
        switch1Checked: false
      });
    }

    this.changeMeshStatus();


  },
  breakfastChange: function (e) {
    console.log("breakfastChange e.detail.value =====" + e.detail.value);

    if (e.detail.value == true) {
      this.setData({
        breakfastStatus: true
      })
    } else {
      this.setData({
        breakfastStatus: false
      });
    }

    this.changeMeshStatus();


  },
  lunchChange: function (e) {
    console.log("lunchChange e.detail.value =====" + e.detail.value);

    if (e.detail.value == true) {
      this.setData({
        lunchStatus: true
      })
    } else {
      this.setData({
        lunchStatus: false
      });
    }

    this.changeMeshStatus();


  },
  dinnerChange: function (e) {
    console.log("dinnerChange e.detail.value =====" + e.detail.value);

    if (e.detail.value == true) {
      this.setData({
        dinnerStatus: true
      })
    } else {
      this.setData({
        dinnerStatus: false
      });
    }

    this.changeMeshStatus();

  },

  changeMeshStatus: function (e) {
    var shopId = wx.getStorageSync('merchantShopId');
    var autoConfig = 0;
    var breakfastStatus = 0;
    var lunchStatus = 0;
    var dinnerStatus = 0;

    if (this.data.switch1Checked) {
      autoConfig = 1;
    } else {
      if (this.data.breakfastStatus) {
        breakfastStatus = 1;
      }
      if (this.data.lunchStatus) {
        lunchStatus = 1;
      }
      if (this.data.dinnerStatus) {
        dinnerStatus = 1;
      }
    }

    var that = this;
    wx.request({
      url: "https://binguoai.com/api/wxapp/shop/meshorder/config",
      method: "POST",
      data: {
        shopId: shopId,
        autoConfig: autoConfig,
        breakfastStatus: breakfastStatus,
        lunchStatus: lunchStatus,
        dinnerStatus: dinnerStatus
      },
      success: function (res) {
        res = res.data;

        if (res.code == 200) {

          that.setData({
            breakfastStatus: res.data.breakfastStatus,
            lunchStatus: res.data.lunchStatus,
            dinnerStatus: res.data.dinnerStatus,
            switch1Checked: res.data.isAutoConfig
          });
        } else {

        }
      }
    });
  },
  toCommemtDataV() {
    wx.navigateTo({
      url: '/pages/comment/dataView/branch/index',
    });
  }
})