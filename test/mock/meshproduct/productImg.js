const app = getApp();

Page({
  data: {
    imgList: null,
    defaultImg: "/assets/u627.png",
    addDisplay: "block",
    opacity: 1
  },


  onLoad: function () {
    wx.setNavigationBarTitle({
      title: "在线订餐菜品图片列表"
    });
    console.log("ccc");
    var that  = this;
    wx.showLoading({
      title: "加载中...",
      mask: true
    });

    let productId = wx.getStorageSync('productId');
    wx.request({
      url: "https://binguoai.com/api/wxapp/productimg/list",
      method: "POST",
      data: {
        productId: productId
      },
      success: function (res) {
        res = res.data;

        if (res.code == 200) {
          wx.showToast({
            title: 'success',
            icon: 'none',
            duration: 10,
            mask: true
          });
          that.setData({
            imgList: res.data
          });

        } else {
          wx.showToast({
            title: '获取用户数据失败',
            icon: 'none',
            duration: 1500,
            mask: true
          });
        }
      }
    });





  },

  delImg: function (event) {
    console.log(event);
    console.log(event.currentTarget.id);

    let productId = wx.getStorageSync('productId');
    wx.showLoading({
      title: "加载中...",
      mask: true
    });
    let that = this;
    wx.request({
      url: "https://binguoai.com/api/wxapp/meshproductimg/del",
      method: "POST",
      data: {
        productImgId: event.currentTarget.id,
        productId: productId
      },
      success: function (res) {
        res = res.data;
        if (res.code == 200) {
          that.setData({
            imgList: res.data
          });


          wx.showToast({
            title: '删除成功',
            icon: 'none',
            duration: 1500,
            mask: true
          });
        } else {

          wx.showToast({
            title: '删除失败',
            icon: 'none',
            duration: 1500,
            mask: true
          });
        }
        wx.hideLoading();
      },
      fail: function () {

        wx.showToast({
          title: '获取用户数据失败',
          icon: 'none',
          duration: 1500,
          mask: true
        });
        wx.hideLoading();
      }
    });
  },
  loadImg: function () {
    wx.showLoading({
      title: "加载中...",
      mask: true
    });

    let that = this;
    let productId = wx.getStorageSync('productId');
    wx.request({
      url: "https://binguoai.com/api/wxapp/productimg/list",
      method: "POST",
      data: {
        productId: productId
      },
      success: function (res) {
        res = res.data;

        if (res.code == 200) {
          that.setData({
            imgList: res.data,
            defaultImg: "/assets/u627.png",
            opacity: "1"
          });


          wx.hideLoading();

          wx.showToast({
            title: '上传图片成功',
            icon: 'none',
            duration: 1500,
            mask: true
          });
        } else {

          wx.showToast({
            title: '获取用户数据失败',
            icon: 'none',
            duration: 1500,
            mask: true
          });
        }
      }
    });
  },

  previewImg: function (event) {
    console.log(event)
    wx.previewImage({
      current: '', // 当前显示图片的http链接
      urls: [event.currentTarget.id] // 需要预览的图片http链接列表
    })
  },

  addImg: function () {
    let that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {

        var tempFilePaths = res.tempFilePaths[0];

        wx.request({
          url: "https://binguoai.com/api/wxapp/qiniu/token",
          success: function (res) {
            res = res.data;
            console.log('get userinfo success');

            if (res.code == 200) {
              wx.uploadFile({
                url: 'https://up.qbox.me',//如果是华北一请用up-z1.qbox.me
                filePath: tempFilePaths,
                name: 'file',
                formData: {
                  'key': tempFilePaths.split('//')[1],
                  'token': res.data
                },
                success: function (res) {
                  var data = JSON.parse(res.data);
                  var url = "http://img.binguoai.com/" + data.key;
                  that.setData({
                    defaultImg: url,
                    opacity: "0"
                  });
                  wx.setStorageSync('productImgUrlTemp', url);


                },
                fail(error) {
                  console.log(error)

                  wx.showToast({
                    title: '上传图片失败',
                    icon: 'none',
                    duration: 1500,
                    mask: true
                  });
                },
                complete(res) {
                  console.log(res)
                }
              });


            } else {
              wx.showToast({
                title: res.message,
                icon: 'none',
                duration: 1500,
                mask: true
              });

            }
          },

          fail: function (error) {
            // 调用服务端登录接口失败

            wx.showToast({
              title: '获取数据失败',
              icon: 'none',
              duration: 1500,
              mask: true
            });
            console.log(error);
          }
        });



      }
    })
  },

  doAddImg: function () {
    var that = this;
    var productId = wx.getStorageSync('productId');
    var imgUrl = wx.getStorageSync('productImgUrlTemp');
    wx.showLoading({
        title: "上传图片中...",
        mask: true
      }
    );

    if (!!imgUrl) {
      wx.request({
        url: "https://binguoai.com/api/wxapp/meshproductimg/create",
        method: "POST",
        data: {
          productId: productId,
          productUrl: imgUrl
        },
        success: function (res) {
          res = res.data;


          if (res.code == 200) {
            wx.setStorageSync('productImgUrlTemp', null);
            that.loadImg();
          } else {
            wx.showToast({
              title: '添加图片失败',
              icon: 'none',
              duration: 1500,
              mask: true
            });
          }
          wx.hideLoading();




        },

        fail: function (error) {
          // 调用服务端登录接口失败
          wx.hideLoading();
          wx.showToast({
            title: '失败',
            icon: 'none',
            duration: 1500,
            mask: true
          });
          console.log(error);

        }
      });
    } else {

      wx.showToast({
        title: '请先选择图片',
        icon: 'none',
        duration: 1500,
        mask: true
      });
    }
  }

})

