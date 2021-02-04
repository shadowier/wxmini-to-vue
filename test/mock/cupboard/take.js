// pages/cupboard/take.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    keykeynumbers: ([1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(item => ({
      key: item,
      name: item,
    }))),
    id: '',
    number_no: "", // 取餐码
    customerId: wx.getStorageSync('customerId'), // customerId 后端说不为空就行
    isCustomer: true, // 不知道是什么 后端说true就行
    shopId: "", // 商户id
    branchId: "", // 分店id
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: "加载中...",
      mask: true
    });
    // TODO: 获取该用户取餐码
    // this.handleOpenGetUserFoodCode();
    // this.id = options.id;
    this.setData({
      id: options.id
    })
    this.getAllFoodBox(options.id);
  },

  // 获取取餐柜列表
  getAllFoodBox(id) {
    // let num = 0;
    // const sideBoards = [{
    //   id: 5,
    //   shopId: 23,
    //   branchId: 9
    // }, {
    //   id: 35
    // }];
    // this.setData({
    //   shopId: sideBoards[0].shopId,
    //   branchId: sideBoards[0].branchId
    // });
    // return;
    const that = this;
    wx.request({
      url: 'https://binguoai.com/api/wxapp/aiyouwei/getSideBoardByCashierDeskId?cashierDeskId=' + id,
      // url: `http://192.168.1.102:9096/api/wxapp/aiyouwei/getSideBoardByCashierDeskId?cashierDeskId=${id}`,
      method: 'GET',
      success: function (res) {
        const {
          data: data
        } = res
        wx.hideLoading()
        if (data.code != 200) {
          wx.hideLoading();
          return wx.showToast({
            title: '服务器错误',
            icon: 'none',
            duration: 1500,
            mask: true
          });
        }

        const list = data.data;
        that.setData({
          shopId: list[0].shopId,
          branchId: list[0].branchId
        });
        that.handleOpenGetUserFoodCode();
      },
      fail: function (res) {
        wx.hideLoading()
      }
    })
  },

  handleOpenGetUserFoodCode() {
    // TODO 获取餐饮码
    // this.number_no = "123123";
    const phone = wx.getStorageSync('phone');
    if (!phone) {
      return;
    }
    const {
      // number_no, // 取餐码
      customerId, // customerId 后端说不为空就行
      // isCustomer, // 不知道是什么 后端说true就行
      shopId, // 商户id
      branchId, // 分店id
    } = this.data;
    const that = this;
    // /api/wxapp/aiyouwei/getCustomerMealCode/{shopId}/{branchId}/{customerId}
    wx.request({
      url: 'https://binguoai.com/api/wxapp/openapi/iSqlquery',
      // url: `http://192.168.1.102:9096/api/wxapp/openapi/iSqlquery`,
      method: 'POST',
      data: {
        "sql_id": "SIDE_CELL-002",
        "params": {
          // "customer_id": wx.getStorageSync('customerId'),
          // "branch_id": wx.getStorageSync('branchId'),
          "customer_phone": phone,
          shopId: this.data.shopId
        },
        "page_num": 1,
        "page_size": 30
      },
      success: function (res) {
        const {
          data: data
        } = res;
        wx.hideLoading()
        if (data.code != 200) {
          return;
        }

        const list = data.data.results || [];
        console.log('that.id', that.data.id)
        const _list = list.sort((a, b) => {
          return a.cashier_desk_id == that.data.id ? -1 : 1;
        })

        that.setData({
          codeList: _list
        });
      },
      fail: function (res) {
        wx.hideLoading()
      }
    })
    // wx.showToast({
    //   title: '已获取到取餐码',
    //   icon: 'none',
    // });
    // this.setData({
    //   number_no: "9527"
    // });
  },
  handleSelectCode(e) {
    if (e.target.dataset.code) {
      this.setData({
        number_no: e.target.dataset.code
      });
    }

  },
  handleTapKey(e) {
    this.setData({
      number_no: this.data.number_no + String(e.target.dataset.key)
    });
    wx.vibrateShort();
  },
  handleTapClearOne() {
    const phoneArr = this.data.number_no.split('');
    phoneArr.pop();
    this.setData({
      number_no: phoneArr.join('')
    });
    wx.vibrateShort(); // 震动
  },
  handleTapClear() {
    wx.vibrateShort(); // 震动
    this.setData({
      number_no: ''
    });
  },
  handleTapConfim() {
    wx.vibrateShort(); // 震动
    const that = this;
    const phone = this.data.phone;
    const number_no = this.data.number_no + '';
    if (!/^\d{1,}$/.test(number_no)) {
      return wx.showToast({
        title: '请填写取餐码',
        icon: 'none',
      });
    }

    // 请求接口
    wx.showLoading({
      title: '开柜中',
    });
    const {
      // number_no, // 取餐码
      customerId, // customerId 后端说不为空就行
      // isCustomer, // 不知道是什么 后端说true就行
      shopId, // 商户id
      branchId, // 分店id
    } = this.data;
    wx.request({
      // url: 'http://192.168.1.102:9096/api/wxapp/aiyouwei/getOrderByMealCode',
      url: `https://binguoai.com/api/wxapp/aiyouwei/getOrderByMealCode`,
      method: 'POST',
      data: {
        mealCode: number_no, // 取餐码
        // customerId, // customerId 后端说不为空就行
        // isCustomer, // 不知道是什么 后端说true就行
        shopId, // 商户id
        branchId, // 分店id
        cashierDeskId: that.data.id
      },
      success: function (res) {
        let {
          data: data
        } = res;
        wx.hideLoading()
        if (data.code == 402) {
          return wx.showToast({
            icon: 'none',
            title: '该取餐码在“' + data.data + '”柜中',
          });
        }
        if (data.code == 200) {
          let list = data.data || [];
          // 提示
          wx.showModal({
            title: '提示',
            content: list.join('号格、') + "号格，打开成功，是否继续取餐？",
            success(res) {
              if (res.confirm) {
                wx.showLoading({
                  title: "加载中...",
                  mask: true
                });
                that.setData({
                  number_no: '',
                  codeList: [],
                });
                // 刷新数据
                that.handleOpenGetUserFoodCode();
              } else if (res.cancel) {
                wx.navigateBack();
              }
            }
          });
        } else {
          wx.showToast({
            title: data.message || '失败',
            icon: "none"
          });
        }
      }
    })


  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})