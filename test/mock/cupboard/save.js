// pages/cupboard/save.js
let timer;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    keykeynumbers: ([1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(item => ({
      key: item,
      name: item,
    }))),
    phone: '',
    showList: false,
    cellList: [],
    copyList: [],
    sideBoards: [],
    activeIndex: 0,
    number_no: "",
    c_id: '',
    showMessageBox: false,
    showMessageBoxClear: true,
    keyShow: true,
    isWarm: false,

    items: [{
        name: '1',
        value: '满'
      },
      {
        name: '2',
        value: '空',
        checked: 'true'
      },
    ],
    isQr: true,
    qrCode: '',
    showQrSave: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      c_id: options.id
    })

    // wx.showLoading({
    //   title: '初始化中',
    // });
    this.getAllFoodBox(options.id);
    // [{
    //   id: 5
    // }, {
    //   id: 35
    // }].forEach(item => {
    //   this.getAllSideBoardCells(item.id);
    // });
  },
  // 获取取餐柜列表
  getAllFoodBox(id) {

    wx.showLoading({
      title: '初始化中',
      mask: true
    });
    // let num = 0;
    // const sideBoards = [{
    //   id: 5
    // }, {
    //   id: 35
    // }].map(item => {
    //   return {
    //     num: num++,
    //     ...item,
    //   }
    // });
    // console.log(sideBoards);
    // this.setData({
    //   sideBoards: sideBoards,
    // });
    // return;
    const that = this;
    wx.request({
      // url: 'https://binguoai.com/api/wxapp/aiyouwei/getSideBoardByCashierDeskId?cashierDeskId=' + id,
      url: `https://binguoai.com/api/wxapp/aiyouwei/getSideBoardByCashierDeskId?cashierDeskId=${id}`,
      method: 'GET',
      success: function (res) {
        const {
          data: data
        } = res
        wx.hideLoading()
        if (data.code != 200) {
          return wx.showToast({
            title: '查询餐柜失败！',
            icon: 'none',
            duration: 1500,
            mask: true
          });
        }
        const list = data.data;
        // 主柜在前
        list.sort((a, b) => a.parentId - b.parentId);
        let num = 0;
        const sideBoards = list.map(item => {
          return Object.assign({
            num: num++,
          }, item);
        });
        that.setData({
          sideBoards: sideBoards,
        });
        sideBoards.forEach((item, index) => {
          that.getAllSideBoardCells(item.id, index);
        });
      },
      fail: function (res) {
        wx.hideLoading()
      }
    })
  },
  // 餐柜格子列表
  getAllSideBoardCells(id, index) {
    const that = this;
    // that.setData({
    //   copyList: [],
    // });
    wx.showLoading({
      title: "加载中...",
      mask: true
    });
    wx.request({
      // url: 'http://192.168.3.71:9091/api/wxapp/aiyouwei/getAllSideBoardCells/1',
      url: `https://binguoai.com/api/wxapp/openapi/iSqlquery`,
      method: 'POST',
      data: {
        "sql_id": "SIDE-CELL-001",
        "params": {
          "side_board_id": id
        },
        "page_num": 1,
        "page_size": 100
      },
      success: function (res) {
        const {
          data: data
        } = res
        wx.hideLoading()
        if (data.code != 200) {
          return wx.showToast({
            title: '查询餐柜失败！',
            icon: 'none',
            duration: 1500,
            mask: true
          });
        }
        that.data.copyList[index] = (data.data.results);
        that.setData({
          copyList: that.data.copyList,
        });
        that.handleShowCellList();
        clearTimeout(timer);
        timer = setTimeout(() => {
          that.handleSelectEmpty();
        }, 400);
      },
      fail: function (res) {
        wx.hideLoading()
      }
    })
  },
  handleShowKey() {
    this.setData({
      keyShow: !this.data.keyShow,
    });
  },
  handleTapKey(e) {
    this.setData({
      phone: this.data.phone + String(e.target.dataset.key)
    });
    wx.vibrateShort();
  },
  handleTapClearOne() {
    const phoneArr = this.data.phone.split('');
    phoneArr.pop();
    this.setData({
      phone: phoneArr.join('')
    });
    wx.vibrateShort(); // 震动
  },
  handleTapClear() {
    wx.vibrateShort(); // 震动
    this.setData({
      phone: ''
    });
  },
  handleTapConfim() {
    wx.vibrateShort(); // 震动
    const that = this;
    const phone = this.data.phone;
    const number_no = this.data.number_no + '';
    if (!/^(?:(?:\+|00)86)?1[3-9]\d{9}$/.test(phone)) {
      return wx.showToast({
        title: '手机号格式不正确！',
        icon: 'none',
      });
    }
    if (!/^\d{1,}$/.test(number_no)) {
      return wx.showToast({
        title: '请选择格子',
        icon: 'none',
      });
    }
    // 提示
    wx.showModal({
      title: '是否确认开“' + number_no + '”号格？',
      content: "请确保手机号“" + phone + "”正确，且目前在取餐柜附近！",
      success(res) {
        if (res.confirm) {
          // 开柜
          that.handleOpen(number_no, () => {
            that.setData({
              isQr: false,
              showMessageBox: true,
            });
            // 提示
            // wx.showModal({
            //   title: '提示',
            //   content: "“" + number_no + "”号柜开柜成功，是否继续存餐？",
            //   success(res) {
            //     if (res.confirm) {
            //       // 刷新数据
            //       that.getAllFoodBox(that.data.c_id);
            //     } else if (res.cancel) {
            //       wx.navigateBack();
            //     }
            //   }
            // });
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    });
  },
  handleOpen(cell_id, cb) {
    wx.showLoading({
      title: "开柜中...",
      mask: true
    });
    const id = this.data.c_id;
    const that = this;
    // console.log(that.data.isWarm);
    const current = this.data.cellList
      .map(_item => _item.find(item => item.cell == cell_id))
      .filter(item => item);

    const cashierDesk = this.data.sideBoards.find(item => item.id == current[0].side_board_id);
    console.log(current, cashierDesk)
    wx.request({
      url: 'https://binguoai.com/api/wxapp/aiyouwei/saveOrderByPhoneForJY',
      // url: 'http://192.168.10.153:9096/api/wxapp/aiyouwei/saveOrderByPhoneForJY',
      method: 'POST',
      data: {
        // id: id,
        cells: cell_id + '',
        shopId: cashierDesk.shopId,
        phone: that.data.phone,
        branchId: that.data.sideBoards[0].branchId,
        isWarm: !!that.data.isWarm,
        cashierDeskId: cashierDesk.cashierDeskId,
      },
      success: function (res) {
        const {
          data: data
        } = res
        wx.hideLoading();
        console.log(data)
        if (data.code != 200) {
          wx.showToast({
            title: data.message || "服务器错误",
            icon: "none",
            duration: 5000,
          });

          that.getAllFoodBox(that.data.c_id);
        } else {
          cb();
          wx.showToast({
            title: '开柜成功！',
            icon: 'none',
            duration: 1200,
            mask: true
          });
        }

      }
    })
  },
  handleSelectWarm() {
    this.setData({
      isWarm: !this.data.isWarm,
    });
  },
  handleShowList() {
    this.setData({
      showList: true,
    })
  },
  onClose() {
    this.setData({
      showList: false,
    })
  },
  handleSelectEmpty() {

    console.log(this.data.copyList)
    const reslist = this.data.copyList.map(item => item.filter(item => !item.status)).filter(item => {
      return item.length;
    });
    console.log('reslist', reslist.length);
    if (!reslist.length) {
      return wx.showToast({
        title: '该柜已无空格!',
        icon: 'none',
      });
    }
    console.log('reslist', reslist.length);
    const effectivelist = this.data.copyList.map(item => item.filter(item => !item.status));
    // tab index
    const activeIndex = effectivelist.findIndex(item => item.length);
    const cellList = [];
    // 随机格子
    effectivelist[activeIndex].forEach(cellItem => {
      cellList.push(cellItem.cell);
    });

    // activeIndex
    // console.log(reslist);
    // reslist.map(item=>{
    //   return item
    // })
    console.log('effectivelist.length', effectivelist.length)
    this.setData({
      activeIndex,
      number_no: cellList[(Math.random() * cellList.length) | 0],
    });
  },
  handleSelectCurrentItem(e) {
    const index = e.currentTarget.dataset.index;

    const current = this.data.cellList
      .map(_item => _item.find(item => item.cell == index))
      .filter(item => item);
    // 判断柜子状态
    if (current[0].status) {
      return wx.showToast({
        title: '该格子已经满了',
        icon: 'none',
      });
    }
    this.onClose();
    // 选中该柜
    this.setData({
      number_no: current[0].cell
    })

  },
  checkboxChange(e) {
    this.data.items.forEach(item => {
      item.checked = false
    })
    e.detail.value.forEach(item => {
      const itemCheckout = this.data.items.find(_item => _item.name == item);
      if (itemCheckout) {
        itemCheckout.checked = true;
      }
    });
    this.setData({
      items: this.data.items
    });
    this.handleShowCellList();
  },
  handleShowCellList() {
    const checked_list = this.data.items.filter(_item => {
      return _item.checked
    });
    if (checked_list.length == 0) {
      return this.setData({
        cellList: this.data.copyList.map(list => list.filter(item => false)),
      });
    }
    const type = checked_list[0].name;
    const isFn = (item) => {
      //全选
      if (checked_list.length == 2) return true;
      if (type == '1') {
        return item.status;
      } else {
        return !item.status;
      }
    };
    const list = this.data.copyList.map(list => list.filter(isFn));
    this.setData({
      cellList: list,
    })
  },
  handleSelectCheckbox() {
    this.setData({
      showMessageBoxClear: !this.data.showMessageBoxClear,
    });
  },
  handleClose() {
    wx.navigateBack();
    this.setData({
      showMessageBox: false,
    });
  },
  handleConfirm() {

    if (this.data.isQr) {
      this.handleScanQr();
      this.setData({
        showMessageBox: false,
      });
      return;
    }
    const that = this;

    if (!this.data.showMessageBoxClear) {
      this.setData({
        phone: '',
        showMessageBox: false,
      });
    } else {
      this.setData({
        showMessageBox: false,
      });
    }
    that.getAllFoodBox(that.data.c_id);

  },
  handleScanQr() {
    const that = this;
    wx.scanCode({
      success(qrcode) {
        console.log(qrcode);

        that.setData({
          number_no: '',
          qrCode: qrcode.result,
          showQrSave: true
        })
      }
    })
  },
  handleQrSave(e) {
    const that = this;

    const cashierDesk = this.data.sideBoards[0]
    const warm = e.target.dataset.warm;
    const qrCode = this.data.qrCode;
    // 发送请求
    wx.showLoading({
      title: '处理中',
      mask: true,
    });

    wx.request({
      //  url: 'http://192.168.10.153:9096/api/wxapp/aiyouwei/saveOrderByZSDQrCode',
      url: 'https://binguoai.com/api/wxapp/aiyouwei/saveOrderByZSDQrCode',
      method: 'POST',
      data: {
        shopId: cashierDesk.shopId,
        branchId: cashierDesk.branchId,
        cashierDeskId: cashierDesk.cashierDeskId,
        orderUrl: qrCode,
        warm: warm == '1' ? true : false,
      },
      success: function (res) {
        const {
          data: data
        } = res
        wx.hideLoading();
        console.log(data)
        wx.hideLoading();
        if (data.code == 200) {
          that.setData({
            showMessageBox: true,
            number_no1: data.data.join(),
            isQr: true,
          });
          that.getAllFoodBox(that.data.c_id);
          that.handleCloseQrShow();
        } else {
          wx.showToast({
            title: data.message || '服务器错误',
          });
        }

      }
    })
  },
  handleCloseQrShow() {
    this.setData({
      qrCode: '',
      showQrSave: false
    })
  }
})