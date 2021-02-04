// dist/pages/selectGroup.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    accounts: [{
      "minorCategoryId": -1,
      "minorCategoryName": "无限量"
    }, {
      "minorCategoryId": 1,
      "minorCategoryName": "有限量"
    }, {
      "minorCategoryId": -2,
      "minorCategoryName": "不提供"
    }],
    accountIndexBreakfast: 0,
    accountIndexLunch: 0,
    accountIndexDinner: 0,
    username: '',
    productName: '',
    productPrice: '',
    productId: '',
    standard: '',
    productCategoryID: '1',
    breakfastGeneralSum: '-1',
    lunchGeneralSum: '-1',
    dinnerGeneralSum: '-1',
    breakfastSum: '',
    lunchSum: '',
    dinnerSum: '',
    showBreakfastInput: false,
    showLunchInput: false,
    showDinnerInput: false,
    description: "",
    foodQuality: '',
    foodArray: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var productId = wx.getStorageSync('productId');
    var shopId = wx.getStorageSync('merchantShopId');

    if (!!productId) {
      this.getDishesFoods();
      wx.setNavigationBarTitle({
        title: '修改在线订餐菜品'
      })
      this.setData({
        "productId": productId
      });

      var productCategoryID = this.data.productCategoryID;

      console.log(productCategoryID);

    }
    if (!!productId) {

      wx.request({
        url: "https://binguoai.com/api/wxapp/meshproduct/info",
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
              "productPrice": res.data.productPrice / 100,
              "productCategoryID": res.data.productCategoryId,
              "breakfastGeneralSum": res.data.breakfastGeneralSum,
              "lunchGeneralSum": res.data.lunchGeneralSum,
              "dinnerGeneralSum": res.data.dinnerGeneralSum,
              "breakfastSum": res.data.breakfastSum,
              "lunchSum": res.data.lunchSum,
              "dinnerSum": res.data.dinnerSum,
              "standard": res.data.standard
            });

            if (res.data.breakfastGeneralSum == 1) {
              that.setData({
                showBreakfastInput: true
              });
            }
            if (res.data.lunchGeneralSum == 1) {
              that.setData({
                showLunchInput: true
              });
            }
            if (res.data.dinnerGeneralSum == 1) {
              that.setData({
                showDinnerInput: true
              });
            }
            var contentData = that.data.accounts;
            var i = 0;
            for (var a in contentData) {
              if (contentData[a].minorCategoryId == res.data.breakfastGeneralSum) {
                that.setData({
                  accountIndexBreakfast: i
                });

              }
              if (contentData[a].minorCategoryId == res.data.lunchGeneralSum) {
                that.setData({
                  accountIndexLunch: i
                });
              }
              if (contentData[a].minorCategoryId == res.data.dinnerGeneralSum) {
                that.setData({
                  accountIndexDinner: i
                });
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




  },

  changeInput(e) {
    let changed = {};
    let prop = e.currentTarget.dataset.prop
    changed[prop] = e.detail.value;
    this.setData(changed)
  },

  bindAccountChangeBreakfast: function (e) {
    console.log('picker account 发生选择改变，携带值为', e.detail.value);

    this.setData({
      accountIndexBreakfast: e.detail.value
    })

    var value = this.data.accounts[e.detail.value];
    console.log(value)

    if (!!value) {
      this.setData({
        breakfastGeneralSum: value.minorCategoryId
      });

      if (value.minorCategoryId == 1) {
        this.setData({
          showBreakfastInput: true
        });
      }
    }

  },

  bindAccountChangeLunch: function (e) {
    console.log('picker account 发生选择改变，携带值为', e.detail.value);

    this.setData({
      accountIndexLunch: e.detail.value
    })

    var value = this.data.accounts[e.detail.value];
    console.log(value)

    if (!!value) {
      this.setData({
        lunchGeneralSum: value.minorCategoryId
      });

      if (value.minorCategoryId == 1) {
        this.setData({
          showLunchInput: true
        });
      }
    }

  },


  bindAccountChangeDinner: function (e) {
    console.log('picker account 发生选择改变，携带值为', e.detail.value);

    this.setData({
      accountIndexDinner: e.detail.value
    })

    var value = this.data.accounts[e.detail.value];
    console.log(value)

    if (!!value) {
      this.setData({
        dinnerGeneralSum: value.minorCategoryId
      });

      if (value.minorCategoryId == 1) {
        this.setData({
          showDinnerInput: true
        });
      }
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

  onSubmitForm: function () {
    var userGroupId;
    if (this.data.accounts[this.data.accountIndex] == undefined) {
      userGroupId = 0;
    } else {
      userGroupId = this.data.accounts[this.data.accountIndex].id;
      if (userGroupId == undefined) {
        userGroupId = 0;
      }
    }

    var that = this;
    var shopId = wx.getStorageSync('merchantShopId');
    var branchId = wx.getStorageSync('branchId');

    if (!!this.data.productId) { //修改
      if (!this.verifyData()) {
        return;
      }
      wx.request({
        url: "https://binguoai.com/api/wxapp/meshproduct/update",
        method: "POST",
        data: {
          productId: this.data.productId,
          productName: this.data.productName,
          productPrice: this.data.productPrice,
          breakfastGeneralSum: this.data.breakfastGeneralSum,
          lunchGeneralSum: this.data.lunchGeneralSum,
          dinnerGeneralSum: this.data.dinnerGeneralSum,
          breakfastSum: this.data.breakfastSum,
          lunchSum: this.data.lunchSum,
          dinnerSum: this.data.dinnerSum,
          standard: this.data.standard,
          branchId: branchId,
          description: this.data.description
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


          } else {
            wx.showToast({
              title: '添加失败，请稍后重试',
              icon: 'none',
              duration: 1500,
              mask: true
            });
          }
        }
      });
    } else { //添加

      if (!this.verifyData()) {
        return;
      }
      wx.request({
        url: "https://binguoai.com/api/wxapp/meshproduct/create",
        method: "POST",
        data: {
          productName: this.data.productName,
          productPrice: this.data.productPrice,
          shopId: shopId,
          breakfastGeneralSum: this.data.breakfastGeneralSum,
          lunchGeneralSum: this.data.lunchGeneralSum,
          dinnerGeneralSum: this.data.dinnerGeneralSum,
          breakfastSum: this.data.breakfastSum,
          lunchSum: this.data.lunchSum,
          dinnerSum: this.data.dinnerSum,
          standard: this.data.standard,
          branchId: branchId,
          description: this.data.description
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

          } else {
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


  verifyData: function () {
    if (!this.data.productName) {
      wx.showToast({
        title: '请填写菜品名称',
        icon: 'none',
        duration: 1500,
        mask: true
      });
      return false;
    }
    if (!this.data.productPrice) {
      wx.showToast({
        title: '请填写菜品价格',
        icon: 'none',
        duration: 1500,
        mask: true
      });
      return false;
    }
    if (!this.data.standard) {
      wx.showToast({
        title: '请填写菜品单位',
        icon: 'none',
        duration: 1500,
        mask: true
      });
      return false;
    }
    if (this.data.breakfastGeneralSum == 1) {

      if (!this.data.breakfastSum) {
        wx.showToast({
          title: '请填写早餐库存量',
          icon: 'none',
          duration: 1500,
          mask: true
        });
        return false;
      }

      let num = this.data.breakfastSum;
      if (!(Number(num) >= 0)) {
        wx.showToast({
          title: '请正确的早餐库存量',
          icon: 'none',
          duration: 1500,
          mask: true
        });
        return false;
      }
    }
    if (this.data.lunchGeneralSum == 1) {

      if (!this.data.lunchSum) {
        wx.showToast({
          title: '请填写中餐库存量',
          icon: 'none',
          duration: 1500,
          mask: true
        });
        return false;
      }
      let num = this.data.lunchSum;
      if (!(Number(num) >= 0)) {
        wx.showToast({
          title: '请正确的中餐库存量',
          icon: 'none',
          duration: 1500,
          mask: true
        });
        return false;
      }
    }
    if (this.data.dinnerGeneralSum == 1) {
      if (!this.data.dinnerSum) {
        wx.showToast({
          title: '请填写晚餐库存量',
          icon: 'none',
          duration: 1500,
          mask: true
        });
        return false;
      }
      let num = this.data.dinnerSum;
      if (!(Number(num) >= 0)) {
        wx.showToast({
          title: '请正确的晚餐库存量',
          icon: 'none',
          duration: 1500,
          mask: true
        });
        return false;
      }

    }
    return true;
  },



  changeInputFoodQuality(e) {
    let foodArray = this.data.foodArray;
    for (let i = 0; i < foodArray.length; i++) {
      foodArray[i].foodQui = this.accMul(e.detail.value, this.accDiv(foodArray[i].foodRate, 100));
    }
    this.setData({
      foodArray,
      foodQuality: e.detail.value
    });
  },



  changeRateInput(e) {
    let index = e.currentTarget.dataset.index;
    let foodArray = this.data.foodArray;
    foodArray[index].foodRate = e.detail.value;
    foodArray[index].foodQui = this.accMul(this.data.foodQuality, this.accDiv(foodArray[index].foodRate, 100));
    this.setData({
      foodArray
    });
  },

  daypartingInput(e) {
    const item = 'dayparting[' + 0 + '].value'
    this.setData({
      [item]: e.detail.value.trim()
    })
  },

  goAddFood() {
    wx.navigateTo({
      url: '/pages/varietyFood/addFood?foodArray=' + JSON.stringify(this.data.foodArray) + '&productName=' + this.data.productName + '&foodQuality=' + this.data.foodQuality
    })
  },


  goReferenceDishes() {
    wx.navigateTo({
      url: '/pages/varietyFood/referenceDishes'
    })
  },

  getDishesFoods: function () {
    let productId = this.data.productId;
    let that = this;
    wx.request({
      url: "https://binguoai.com/nutrients/api/dishesNutrientsById?dishesId=" + wx.getStorageSync('productId'),
      method: "POST",
      data: {},
      success: function (res) {
        res = res.data;
        let foodArray = [];
        if (res.code == 200) {
          for (let i = 0; i < res.data.dishesFoods.length; i++) {
            let obj = {};
            obj.foodName = res.data.dishesFoods[i].name;
            obj.foodRate = that.accMul(res.data.dishesFoods[i].foodProportion, 100);
            obj.code = res.data.dishesFoods[i].code;
            obj.foodQui = that.accMul(res.data.weight, res.data.dishesFoods[i].foodProportion);
            foodArray.push(obj);
          }
          that.setData({
            foodArray,
            foodQuality: res.data.weight
          })

        } else {
          wx.showToast({
            title: res.msg,
            icon: 'none',
            duration: 1500,
            mask: true
          });
        }
      }
    });
  },
  accDiv(arg1, arg2) {
    var t1 = 0,
      t2 = 0,
      r1, r2;
    try {
      t1 = arg1.toString().split(".")[1].length;
    } catch (e) {}
    try {
      t2 = arg2.toString().split(".")[1].length;
    } catch (e) {}
    r1 = Number(arg1.toString().replace(".", ""));
    r2 = Number(arg2.toString().replace(".", ""));
    return (r1 / r2) * Math.pow(10, t2 - t1);
  },
  accMul(arg1, arg2) {
    var m = 0,
      s1 = arg1.toString(),
      s2 = arg2.toString();
    try {
      m += s1.split(".")[1].length;
    } catch (e) {}
    try {
      m += s2.split(".")[1].length;
    } catch (e) {}
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
  },
  onFoodSubmitForm() {

    if (!this.data.productId) {
      wx.showToast({
        title: '操作失败，请先确定创建菜品！',
        icon: 'none',
        duration: 2000
      });
      return
    }

    if (this.data.productName.trim().length == 0) {
      wx.showToast({
        title: '操作失败，菜品名不能为空！',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (this.data.foodQuality.toString().trim().length == 0) {
      wx.showToast({
        title: '操作失败，菜品重量不能为空！',
        icon: 'none',
        duration: 2000
      })
      return
    }
    let temp = [];
    let foodArray_ = this.data.foodArray;
    let totalRate = 0;
    for (let i = 0; i < foodArray_.length; i++) {
      let obj = {};
      obj.name = foodArray_[i].foodName;
      obj.code = foodArray_[i].code;
      obj.proportion = this.accDiv(foodArray_[i].foodRate, 100);
      obj.netContent = this.accMul(this.data.foodQuality, this.accDiv(foodArray_[i].foodRate, 100));
      obj.seq = i + 1;
      temp.push(obj);
      totalRate += Number(foodArray_[i].foodRate);
    }
    // return;
    if (totalRate !== 100) {
      wx.showToast({
        title: '操作失败，食材占比总和不是100！',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    wx.request({
      url: "https://binguoai.com/nutrients/api/saveDishesFood",
      method: "POST",
      data: {
        "name": this.data.productName,
        "weight": this.data.foodQuality,
        "userId": wx.getStorageSync('customerId'),
        "merchantId": wx.getStorageSync('merchantShopId'),
        "merchantDishesId": this.data.productId,
        "dishesFoodList": temp
      },
      success: function (res) {

        res = res.data;

        if (res.code == 200) {
          wx.showToast({
            title: '成功',
            duration: 1500,
            mask: true
          });
          wx.navigateBack({})
        } else {
          wx.showToast({
            title: res.msg || res.message,
            icon: 'none',
            duration: 1500,
            mask: true
          });
        }
      }
    });
  },

  deleteListFood: function (event) {
    let index = event.currentTarget.dataset.index;
    let foodArray = this.data.foodArray;
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定要删除『' + foodArray[index].foodName + '』列表项吗？',
      success(res) {
        if (res.confirm) {
          foodArray.splice(index, 1);
          that.setData({
            foodArray
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  bindAccountChange: function (e) {
    // console.log('picker account 发生选择改变，携带值为', e.detail.value);

    this.setData({
      accountIndex: e.detail.value
    })

    var value = this.data.accounts[e.detail.value];
    // console.log(value)

    if (!!value) {
      this.setData({
        productCategoryID: value.minorCategoryId
      })
    }



  },



})