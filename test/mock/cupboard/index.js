// pages/cupboard/index.js
const ypRequest = require('../../lib/ypRequest');
const log = require('../../lib/log');
const domain = 'https://binguoai.com';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: null,
    c_id: '',
    showSave: false,
    isNoError: false,
    sideBoardName: '',
    shopId: 0,
    isShowDialog: false,
    isPhone: null,
    isOpen: false,
    cellSum: 0,
    support_phone: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('options', JSON.stringify(options));
    log.info('options', JSON.stringify(options))

    this.setData({
      c_id: options.scene,
    });
    wx.showLoading({
      title: '初始化中',
      mask: true,
    });
    let that = this;

    // 
    this.setData({
      isNoError: false,
    });
    // 判断取餐柜
    wx.request({
      url: domain + '/api/wxapp/openapi/iSqlquery',
      // url: 'http://192.168.1.102:9096/api/wxapp/openapi/iSqlquery',
      method: 'POST',
      data: {
        "sql_id": "SIDE-BOARD-002",
        "params": {
          "cashierDeskId": options.scene
        },
        "page_num": 1,
        "page_size": 100
      },
      success: function (res) {
        let {
          data: data
        } = res;
        wx.hideLoading();

        if (data.code != 200 || !data.data.results || !data.data.results.length) {
          that.setData({
            isNoError: true,
          });
        } else {
          data = data.data.results[0] || {};

          const main = data;
          that.setData({
            shopId: main.shopId,
            support_phone: main.support_phone,
            sideBoardName: main.side_board_name
          });
          // main.branchId
          wx.setStorageSync('support_phone', main.support_phone);
          wx.setStorageSync('merchantShopId', main.shopId);
          wx.setStorageSync('branchId', main.branchId);

          const phone = wx.getStorageSync('phone');
          if (typeof phone === 'string' && phone.length > 1) {
            wx.hideLoading();
            that.handleLoginInit();
            return;
          }
          that.handleLogin().then(data => {
            if (!data.userId || !(!!data.phone && data.phone != '')) {
              // wx.showToast({
              //   icon: 'none',
              //   title: '用户未注册',
              // });
              that.setData({
                isShowDialog: true,
              });

              // wx.navigateTo({
              //   url: 'pages/home/home',
              // });

              return;
            } else {
              that.userId = data.userId;
              wx.setStorageSync('customerId', that.userId);
              wx.setStorageSync('phone', data.phone);
              that.setData({
                isPhone: true,
              });
              wx.hideLoading();
              that.handleLoginInit();
            }

          }).catch(err => {
            console.log(err);
            log.warn(err)
            wx.hideLoading()
            that.setData({
              isShowDialog: true,
            });

            // wx.redirectTo({
            //   url: 'pages/home/home',
            // });
            if (err.code) {
              wx.showToast({
                icon: 'none',
                title: err.message,
              });
            } else {
              wx.showToast({
                title: '错误',
                icon: 'none'
              });
            }
          })
        }
      },
      fail: function (res) {
        wx.hideLoading()
      }
    });
  },
  handleLoginInit() {
    this.handleQueryCellSum().then(() => {
      this.queryUserIsPermissions();
    });
  },
  queryUserIsPermissions(cb) {

    const branchId = wx.getStorageSync('branchId');
    const phone = wx.getStorageSync('phone');
    wx.showLoading({
      title: '正在处理',
      mask: true,
    });
    const that = this;
    wx.request({
      // url: "http://192.168.1.102:9096/api/wxapp/qucangui/queryUserStatus",
      url: domain + "/api/wxapp/qucangui/queryUserStatus",
      method: "POST",
      data: {
        "branchId": branchId,
        // "deskId": 0,
        "phone": phone,
        type: 2,
      },
      success: function (res) {
        res = res.data;
        wx.hideLoading()
        if (res.code == 200) {
          that.setData({
            showSave: true
          });
        } else {
          // that.setData({
          //   shouldLogin: false
          // });
        }
      },
      fail() {
        wx.hideLoading()
      }
    });
  },
  // 获取用户信息
  handleLogin() {
    wx.showLoading({
      title: "登录中",
      mask: true,
    });
    return new Promise((ok, gg) => {
      wx.login({
        success(res) {
          // console.log('res.code',res.code);
          // log.info('res.code', res.code)
          // return ;
          wx.request({
            url: domain + '/api/wxapp/authorizeTemp',
            // url: 'http://192.168.1.102:9096/api/wxapp/authorizeTemp',
            method: 'POST',
            data: {
              code: res.code
            },
            success(resData) {
              wx.hideLoading();
              const data = resData.data;
              if (data.code == 200) {
                console.log(data.data);
                log.info(data.data)
                ok(data.data);
              } else {
                gg(data);
              }
            },
            fail(error) {
              wx.hideLoading();
              gg(error);
            }
          })
        }
      })
    });
  },
  handleQueryCellSum() {
    wx.showLoading({
      title: '查询取餐码中',
      mask: true,
    });
    const phone = wx.getStorageSync('phone');
    const that = this;
    return this.handleQueryCell(phone).then(cells => {
        wx.hideLoading();
        that.setData({
          cellSum: (cells || []).length
        });
      })
      .catch(e => {
        console.warn(e);
        wx.hideLoading();
        // wx.showToast({
        //   title: e && e.message || '未知错误',
        //   icon: 'none',
        //   duration: 3000
        // });
      })
  },
  handleQueryCell(phone) {

    const merchantShopId = wx.getStorageSync('merchantShopId');
    return ypRequest.post('/api/wxapp/openapi/iSqlquery', {
      "sql_id": "SIDE_CELL-002",
      "params": {
        "customer_phone": phone,
        "shopId": this.data.shopId,
        // "cashier_desk_id": this.data.c_id
      },
      "page_num": 1,
      "page_size": 30
    }).then(res => {
      // 获取当前柜子的取餐码
      console.log(res);
      log.info(res)
      const results = res.results;
      if (!results || !results.length) {
        throw new Error('没有在查询到取餐码');
      }
      const currentCodeList = results.filter(item => item.cashier_desk_id == this.data.c_id);
      if (!currentCodeList.length) {
        const cashier_desk_name = results.map(item => item.side_board_name);
        throw new Error('该柜中未查询到,请前往【' + cashier_desk_name.join('、') + '】');
      }
      const codelist = currentCodeList.map(item => {
        return item.meal_code;
      });
      // this.handleSendOpen(codelist);
      return codelist;
    });
  },
  handleOpenAll() {
    this.setData({
      isOpen: false,
    });
    // 判断是否存在手机号
    const phone = wx.getStorageSync('phone');
    if (!phone) {
      this.setData({
        isShowDialog: true,
        isOpen: true,
      });
      return;
    }
    // 获取取餐码
    wx.showLoading({
      title: '查询取餐码中',
      mask: true,
    });
    this.handleQueryCell(phone).then(cells => {
      this.handleSendOpen(cells);
    }).catch(e => {
      console.warn(e);
      wx.hideLoading();
      wx.showToast({
        title: e && e.message || '未知错误',
        icon: 'none',
        duration: 3000
      });
    });
  },
  handleSendOpen(codelsit) {
    wx.showLoading({
      title: '一键开柜中',
      mask: true,
    });
    const that = this;
    console.log('codelsit', codelsit);
    log.info('codelsit', codelsit)
    codelsit = Array.from(new Set(codelsit));
    const merchantShopId = wx.getStorageSync('merchantShopId');
    const branchId = wx.getStorageSync('branchId');
    ypRequest.post('/api/wxapp/aiyouwei/getOrderByMealCode', {
      "mealCode": codelsit.join(),
      "shopId": merchantShopId,
      "branchId": branchId,
      "cashierDeskId": this.data.c_id
    }).then(res => {
      wx.hideLoading();
      wx.showModal({
        title: '开柜成功',
        showCancel: false,
        content: '分别是：' + res.join('号格、') + "号格",
        success(res) {},
        fail() {

        },
        complete() {
          that.handleQueryCellSum();
        }
      });
      // that.setData({
      //   cellSum: 0,
      // });
    }).catch(e => {
      wx.hideLoading();
      if (e && e.code) {
        wx.showToast({
          title: e.message || '未知错误',
          icon: 'none',
        })
      }
      that.handleQueryCellSum();
    });

  },
  handleAction(e) {
    console.log(e);
    log.info(e)
    const type = e.target.dataset.type || e.currentTarget.dataset.type;
    console.log('type', type);
    log.info('type', type)
    let url = 'take';
    if (type == 1) {
      url = 'save';
    } else if (type == 2) {
      url = "scanQr";
    } else if (type == 3) {
      url = "maintenance";
    } else if (type == 4) {
      url = 'take';
    } else if (type == 6) {
      this.handleOpenAll();
      return;
    } else if (type == 110) {
      wx.showToast({
        title: '暂未开通  受权限控制',
        icon: "none",
        duration: 3000
      });
      return;
    }
    wx.navigateTo({
      url: url + "?id=" + this.data.c_id,
    });
  },
  onShareAppMessage() {
    return {
      title: this.data.sideBoardName,
      path: "pages/cupboard/index?scene=" + this.data.c_id,
    }
  },
  onCancel() {
    this.setData({
      isShowDialog: false,
    });
    if (this.data.isOpen) {
      this.setData({
        isOpen: false,
      });
      this.handleAction({
        target: {
          dataset: {
            type: 4
          }
        }
      });
    }
  },
  onConfirm(e) {
    e.detail.dialog.stopLoading();
  },
  onError(e) {
    console.log(e);
    log.info(e)
  },
  onGetPhoneNumber(e) {
    console.log(e);
    log.info(e)
    const that = this;
    const {
      encryptedData,
      iv
    } = e.detail;
    wx.showLoading({
      title: '处理中',
      mask: true
    });
    wx.login({
      success(e) {
        const code = e.code;
        const data = {
          code: code,
          encryptedData,
          iv,
        };
        ypRequest.post('/api/wxapp/phoneByCode', data).then(data => {
          wx.hideLoading();
          wx.setStorageSync('phone', data);
          that.setData({
            isPhone: true,
            isShowDialog: false,
          });
          if (that.data.isOpen) {
            that.handleOpenAll();
          } else {
            that.queryUserIsPermissions();
          }
        }).catch(e => {
          console.error(e);
          wx.hideLoading()
          if (e && e.code) {
            wx.showToast({
              title: e.message,
              icon: 'none',
            });
          }
        })
        return false;
      },
      find() {
        wx.hideLoading()
      }
    })
    // 
  },
  handleCallSc() {
    wx.makePhoneCall({
      phoneNumber: this.data.support_phone, // 手机号
    });
  }
})