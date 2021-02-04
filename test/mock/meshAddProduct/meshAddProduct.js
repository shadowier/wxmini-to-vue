// dist/pages/selectGroup.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    accounts: [""],
    accountIndex: 0,
    username:'',
    productName:'',
    productPrice:'',
    productId:'',
    productCategoryID:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var productId = wx.getStorageSync('productId');
    var shopId = wx.getStorageSync('merchantShopId');

    if (!!productId) {
      wx.setNavigationBarTitle({
        title: '修改菜品'
      })
      this.setData({
        "productId": productId
      });

      var productCategoryID = this.data.productCategoryID;

      console.log(productCategoryID);

    }
    wx.request({
      url: "https://binguoai.com/api/wxapp/product/getProductCategoryList",
      method: "POST",
      data: {
        shopID: shopId,
      },
      success: function (res) {
        console.log(res);
        res = res.data;

        if (res.code == 200) {
          that.setData({"accounts": res.data});

          if (res.data.length > 0){
            that.setData({
              "productCategoryID": res.data[0].minorCategoryId
            });
          }



          if (!!productId) {

            wx.request({
              url: "https://binguoai.com/api/wxapp/product/info",
              method: "POST",
              data: {
                productId: that.data.productId,
              },
              success: function (res) {
                console.log(res);
                res = res.data;

                if (res.code == 200) {
                  that.setData({
                    "productName": res.data.productName,
                    "productPrice": res.data.productPrice,
                    "productCategoryID": res.data.productCategoryId
                  });

                  var contentData = that.data.accounts;
                  var i = 0;
                  console.log("i=" + i);
                  console.log("contentData=" + contentData);
                  for (var a in contentData) {
                    console.log(a);
                    console.log(contentData[a]);

                    console.log(i);
                    console.log("contentData[a].minorCategoryId=" + contentData[a].minorCategoryId);
                    console.log("res.data.productCategoryId=" + res.data.productCategoryId);
                    if (contentData[a].minorCategoryId == res.data.productCategoryId) {
                      that.setData({
                        accountIndex: i
                      });
                      console.log(i);
                      break;
                    }
                    i++;
                  }


                } else {
                  wx.showToast({
                    title: '请稍后重试',
                    icon: 'none',
                    duration: 1500,
                    mask: true
                  });
                }
              }
            });
          }


        } else {
          wx.showToast({
            title: '请稍后重试',
            icon: 'none',
            duration: 1500,
            mask: true
          });
        }
      }
    });




  },

  changeInput(e) {
    let changed = {};
    let prop = e.currentTarget.dataset.prop
    changed[prop] = e.detail.value;
    this.setData(changed)
  },

  bindAccountChange: function (e) {
    console.log('picker account 发生选择改变，携带值为', e.detail.value);

    this.setData({
      accountIndex: e.detail.value
    })

    var value = this.data.accounts[e.detail.value];
    console.log(value)

    if(!!value){
      this.setData({
        productCategoryID: value.minorCategoryId
      })
    }



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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  onSubmitForm: function() {
    var userGroupId;
    if (this.data.accounts[this.data.accountIndex] == undefined){
      userGroupId = 0;
    }else{
      userGroupId = this.data.accounts[this.data.accountIndex].id;
      if (userGroupId == undefined) {
        userGroupId = 0;
      }
    }

    var that = this;
    var shopId = wx.getStorageSync('merchantShopId');

    if (!!this.data.productId){//修改
      wx.request({
        url: "https://binguoai.com/api/wxapp/product/update",
        method: "POST",
        data:{
          productId : this.data.productId,
          productName: this.data.productName,
          productPrice: this.data.productPrice,
          productCategoryID: this.data.productCategoryID
        },
        success: function (res) {
          console.log(res);
          res = res.data;

          if (res.code == 200) {
            wx.showToast({
              title: '修改成功',
              icon: 'none',
              duration: 1500,
              mask: true
            });


          }else{
            wx.showToast({
              title: '添加失败，请稍后重试',
              icon: 'none',
              duration: 1500,
              mask: true
            });
          }
        }
      });
    } else {//添加
      wx.request({
        url: "https://binguoai.com/api/wxapp/product/create",
        method: "POST",
        data:{
          productName: this.data.productName,
          productPrice: this.data.productPrice,
          shopId: shopId,
          productCategoryID: this.data.productCategoryID
        },
        success: function (res) {
          console.log(res);
          res = res.data;

          if (res.code == 200) {
            wx.showToast({
              title: '添加成功',
              icon: 'none',
              duration: 1500,
              mask: true
            });
            setTimeout(function () {
              wx.navigateBack({
                delta: 1
              })
            }, 1500);

          }else{
            wx.showToast({
              title: '添加失败，请稍后重试',
              icon: 'none',
              duration: 1500,
              mask: true
            });
          }
        }
      });

    }

  },




})
