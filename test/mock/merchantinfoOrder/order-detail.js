"use strict";

function _toConsumableArray(arr) {
  return (
    _arrayWithoutHoles(arr) ||
    _iterableToArray(arr) ||
    _unsupportedIterableToArray(arr) ||
    _nonIterableSpread()
  );
}

function _nonIterableSpread() {
  throw new TypeError(
    "Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
  );
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen);
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter))
    return Array.from(iter);
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }
  return arr2;
}

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
      args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(undefined);
    });
  };
}

var _utils = require("./../../lib/utils.js");

var _requests = require("./../../net/requests.js");

var _dialog = require("./../../assets/vant/dialog/dialog.js");

var YpRequest = require("./../../lib/ypRequest");

var _dialog = _interopRequireDefault(_dialog);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ?
    obj : {
      default: obj
    };
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    order: {},
    orderNo: "",
    orderImg: "",
    surcharge: [],
    isShowBase64: true,
    orderItems: [],
    orderStatus: 0,
    surchargeCount: 0,
    showDialog: false,
    timerConfirm: undefined,
    isSurcharge: false,
    isWarm: false,
    payType: {
      0: "手机支付",
      1: "免密支付",
      2: "刷卡支付",
      3: "线下支付"
    },
    payTypeStyle: {
      0: "theme-phone",
      1: "theme-nopwd",
      2: "theme-card",
      3: "theme-shop"
    },
    orderStatusType: {
      0: "未存餐",
      1: "未取餐",
      2: "已取餐"
    },
    orderStatusStyle: {
      0: "theme-shop",
      1: "theme-phone",
      2: "theme-nopwd"
    },
    switchChecked: false,
    mealCode: "",
    isLoad: false,
    isComment: false
  },
  hintTap: function hintTap() {
    wx.showToast({
      title: "智能餐柜多次存餐的开关",
      icon: "none",
      duration: 2000,
      mask: true
    });
  },
  // 开启多次存餐的开关
  onChangeSwitch: function onChangeSwitch(_ref) {
    var _this = this;

    var detail = _ref.detail;

    // 需要手动对 checked 状态进行更新
    _dialog.default
      .confirm({
        title: "提示",
        message: "是否开启多次存餐？"
      })
      .then(function () {
        // on confirm
        _this.setData({
          switchChecked: detail
        });
      })
      .catch(function () {
        // on cancel
      }); // this.setData({
    //   switchChecked: detail
    // });
  },
  // 取消开柜
  cancelDialog: function cancelDialog() {
    this.setData({
      showDialog: false,
      orderStatus: 1
    });
  },
  // 确认开柜直到取消
  confirmDialog: function confirmDialog() {
    var _this3 = this;

    return _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        var isWarm, shopId, branchId, orderNo, openRes;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch ((_context.prev = _context.next)) {
              case 0:
                isWarm = _this3.data.isWarm;

                if (_this3.data.timerConfirm) {
                  clearTimeout(_this3.data.timerConfirm);
                }

                shopId = wx.getStorageSync("merchantShopId");
                branchId = wx.getStorageSync("branchId");
                orderNo = _this3.data.orderNo;
                wx.showLoading({
                  title: "开柜中...",
                  mask: true
                });
                _context.next = 8;
                return new Promise(function (resolve, reject) {
                  wx.request({
                    url: "https://binguoai.com/api/wxapp/aiyouwei/saveOrderByMealCode",
                    // url: 'https://binguoai.com/api/wxapp/aiyouwei/saveOrderByMealCode',
                    method: "POST",
                    data: {
                      shopId: shopId,
                      branchId: branchId,
                      orderId: orderNo,
                      type: _this3.data.switchChecked ? 1 : 0,
                      isWarm: isWarm,
                      mealCode: _this3.data.mealCode
                    },
                    success: function success(res) {
                      resolve(res.data);
                    }
                  });
                });

              case 8:
                openRes = _context.sent;
                wx.hideLoading();

                if (!(openRes.code != 200)) {
                  _context.next = 14;
                  break;
                }

                wx.showToast({
                  title: openRes.message,
                  icon: "none",
                  duration: 1500,
                  mask: true
                });

                _this3.setData({
                  showDialog: false
                });

                return _context.abrupt("return");

              case 14:
                _this3.setData({
                  showDialog: false
                });

                wx.showToast({
                  title: "开柜成功！",
                  icon: "none",
                  duration: 500,
                  mask: true
                }); // const timerConfirm = setTimeout(() => {
                //   this.setData({
                //     showDialog: true
                //   })
                // }, 1500);

                _this3.setData({
                  // timerConfirm,
                  showDialog: true
                });

              case 17:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      })
    )();
  },
  // 一键存餐、开柜
  takeMeals: function takeMeals() {
    var _this4 = this;

    var that = this;
    var shopId = wx.getStorageSync("merchantShopId");
    var branchId = wx.getStorageSync("branchId");
    var orderNo = this.data.orderNo;
    var isWarm = this.data.isWarm;

    _dialog.default
      .confirm({
        title: "提示",
        message: "请确保您在取餐柜附近， 是否确认开柜？",
        asyncClose: true
      })
      .then(function () {
        wx.showLoading({
          title: "开柜中...",
          mask: true
        });
        wx.request({
          url: "https://binguoai.com/api/wxapp/aiyouwei/saveOrderByMealCode",
          // url: 'http://192.168.43.185:9091/api/wxapp/aiyouwei/openByWxButton',
          // url: 'https://binguoai.com/api/wxapp/aiyouwei/saveOrderByMealCode',
          method: "POST",
          data: {
            shopId: shopId,
            branchId: branchId,
            orderId: orderNo,
            isWarm: isWarm,
            type: _this4.data.switchChecked ? 1 : 0,
            mealCode: _this4.data.mealCode
          },
          success: function success(res) {
            wx.hideLoading();
            var data = res.data;

            if (data.code != 200) {
              wx.showToast({
                title: data.message,
                icon: "none",
                duration: 1200,
                mask: true
              });

              _dialog.default.close();

              return;
            }

            wx.showToast({
              title: "开柜成功！",
              icon: "none",
              duration: 500,
              mask: true
            });

            _dialog.default.close(); // that.setData({
            //   orderStatus: 1
            // })
            // that.setData({
            //   showDialog: true
            // })

            if (!that.data.switchChecked) {
              that.setData({
                orderStatus: 1
              });
            }

            if (that.data.switchChecked) {
              var timer = setTimeout(function () {
                that.setData({
                  showDialog: true
                });
              }, 1300);

              if (that.data.switchChecked) {
                that.setData({
                  showDialog: true
                });
              } // that.setData({
              //   showDialog: true
              // })
            }
          }
        });
      })
      .catch(function () {
        // on cancel
        _dialog.default.close();
      });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    var _this2 = this;

    var that = this;
    var orderNo = options.orderNo;
    this.setData({
      orderNo: orderNo
    }); // this.getOrderStatus()

    wx.showLoading({
      title: "加载中...",
      mask: true
    });
    this.getOrderDetailAnd(orderNo);
  },
  getOrderDetailAnd: function getOrderDetailAnd(orderNo) {
    var _this5 = this;

    return _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2() {
        var that,
          customerId,
          orderDetail,
          orderItems,
          surcharge,
          base64,
          detailRes,
          item,
          surchargeRes,
          res2,
          orderStatusRes,
          base64Res,
          base64Data,
          payCode,
          base64Array,
          data,
          array;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch ((_context2.prev = _context2.next)) {
              case 0:
                that = _this5;
                customerId = wx.getStorageSync("customerId");
                orderDetail = {};
                orderItems = [];
                surcharge = [];
                base64 = ""; // 获取订单详情

                _context2.next = 8;
                return new Promise(function (resolve, reject) {
                  wx.request({
                    // url: `http://192.168.3.71:9091/api/wxapp/order/detail/${orderNo}`,
                    // url: `http://192.168.10.27/api/wxapp/order/detail/${orderNo}`,
                    url: "https://binguoai.com/api/wxapp/order/detail/".concat(
                      orderNo
                    ),
                    method: "GET",
                    success: function success(res) {
                      resolve(res.data);
                    }
                  });
                });

              case 8:
                detailRes = _context2.sent;

                if (detailRes.code == 200) {
                  item = detailRes.data;
                  item.formateOrderTime = _utils.Formatter.format(
                    item.payTime,
                    "YYYY-MM-DD HH:mm"
                  );
                  item.note = (item.note || "").replace(/\n/g, " "); // that.setData({
                  //   order: item,
                  //   orderItems: item.orderItems
                  // })

                  _this5.handleHasComment(item);

                  orderDetail = item;
                  orderItems = item.orderItems;
                } // 获取订单存餐和加热详情 判断是否是取餐柜订单

                _context2.next = 12;
                return new Promise(function (resolve, reject) {
                  wx.request({
                    url: "https://binguoai.com/api/wxapp/detail/surcharge/".concat(
                      orderNo
                    ),
                    // url: `https://binguoai.com/api/wxapp/detail/surcharge/${orderNo}`,
                    method: "GET",
                    success: function success(res) {
                      resolve(res);
                    },
                    fail: function fail(res) {
                      resolve(res);
                    }
                  });
                });

              case 12:
                surchargeRes = _context2.sent;
                res2 = surchargeRes.data;

                if (!(res2.code != 200)) {
                  _context2.next = 18;
                  break;
                }

                wx.hideLoading();
                that.setData({
                  orderImg: "",
                  order: orderDetail,
                  orderItems: orderItems,
                  surchargeCount: 0,
                  isLoad: true
                });
                return _context2.abrupt("return");

              case 18:
                _context2.next = 20;
                return new Promise(function (resolve, reject) {
                  wx.request({
                    // url: `https://binguoai.com/api/wxapp/aiyouwei/getOrderStatus/${orderNo}`,
                    url: "https://binguoai.com/api/wxapp/aiyouwei/getOrderStatus/".concat(
                      orderNo
                    ),
                    method: "GET",
                    success: function success(res) {
                      var data = res.data;
                      resolve(data);
                    }
                  });
                });

              case 20:
                orderStatusRes = _context2.sent;
                console.log(_context2.sent);

                _context2.next = 23;
                return new Promise(function (resolve, reject) {
                  wx.request({
                    // url: 'http://192.168.43.185:9091/api/wxapp/aiyouwei/getQrCodeBase64',
                    // url: 'http://192.168.3.71:9091/api/wxapp/aiyouwei/getQrCodeBase64',
                    url: "https://binguoai.com/api/wxapp/aiyouwei/getQrCodeBase64",
                    method: "GET",
                    data: {
                      orderId: orderNo,
                      isCustomer: "1"
                    },
                    success: function success(res) {
                      resolve(res.data);
                      console.log(res.data);

                    },
                    fail: function fail(e) {
                      reject(e);
                    }
                  });
                });

              case 23:
                base64Res = _context2.sent;
                base64Data = base64Res.data.replace(/[\r\n]/g, "");
                payCode = base64Data;
                base64Array = wx.base64ToArrayBuffer(payCode);
                base64 = wx.arrayBufferToBase64(base64Array);
                console.log(base64);

                if (res2.code == 200) {
                  data = res2.data;

                  if (!!data.warm) {
                    _this5.setData({
                      isWarm: true
                    });

                    surcharge = [{
                        productName: "存餐费",
                        quantity: 1,
                        realPrice: data.price
                      },
                      {
                        productName: "加热费",
                        quantity: 1,
                        realPrice: data.warm
                      }
                    ];
                  } else {
                    surcharge = [{
                      productName: "存餐费",
                      quantity: 1,
                      realPrice: data.price
                    }];
                  }
                }

                array = [].concat(
                  _toConsumableArray(orderItems),
                  _toConsumableArray(surcharge)
                );
                wx.hideLoading();
                that.setData({
                  orderImg: "data:image/jpeg;base64," + base64,
                  order: orderDetail,
                  orderItems: array,
                  surchargeCount: surcharge.length,
                  isLoad: true,
                  orderStatus: orderStatusRes.data.code,
                  mealCode: orderStatusRes.data.mealCode
                });

              case 32:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      })
    )();
  },
  toProductDetailPage: function toProductDetailPage(event) {
    console.log("event.currentTarget.id=====" + event.currentTarget.id);
    wx.setStorageSync("productId", event.currentTarget.id);
    wx.navigateTo({
      url: "/pages/productsource/productsource"
    });
  },
  handleHasComment: function handleHasComment(order) {
    var _this6 = this;

    var oid = this.data.orderNo; // const order = this.data.order;

    YpRequest.post(
        "https://tc.yunpengai.com/comment/record/getCommentRecords", {
          entityCode: "001",
          entityId: oid,
          bizId: {
            "1_merchantId": order.shopId,
            "2_branchId": order.branchId || 9 // TODO: 等字段中
          }
        }
      )
      .then(function (res) {
        _this6.setData({
          isComment: !(!res || !res.length)
        });
      })
      .catch(function (e) {
        console.log(e);
      });
  },
  handleClickAction: function handleClickAction(e) {
    var type = e.currentTarget.dataset.type;
    var localData = Object.assign({}, this.data.order);
    var oid = this.data.orderNo;
    wx.setStorageSync("o_" + oid, localData);

    if (type == "1") {
      // wx.navigateTo({
      //   url: '/pages/comment/comment/index?oid=' + oid,
      // });
      var merchantShopId = wx.getStorageSync("merchantShopId");
      wx.navigateTo({
        url: "/pages/comment/detail/index?oid=" + oid + "&shop=" + merchantShopId
      });
    } else {}
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function onShow() {
    wx.showLoading({
      title: "加载中...",
      mask: true
    });
    this.getOrderDetailAnd(this.data.orderNo);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function onUnload() {
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    prevPage.setData({
      isBack: true
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function onShareAppMessage() {},

  handleShowImage() {
    wx.previewImage({
      urls: [this.data.order.productOrderUrl],
    })
  }
});