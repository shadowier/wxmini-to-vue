// pages/dataV/detail.js
const ypRequest = require('../../lib/ypRequest.js');
const {
  Formatter
} = require('../../lib/utils.js');
const currentDate = Formatter.format(new Date().toString(), 'YYYY-MM-DD');
let m_date1 = new Date();
m_date1.setDate(1);
let m_date2 = new Date();
m_date2.setMonth(m_date2.getMonth() + 1);
m_date2.setDate(0);
m_date1 = Formatter.format(m_date1, 'YYYY-MM-DD');
m_date2 = Formatter.format(m_date2, 'YYYY-MM-DD');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    alllist: [],
    indexItem: 3,
    infoStatText: "加载中",
    currentDate: currentDate,
    date1: m_date1, // 当月
    date2: m_date2, // 当月
    dateEnd: currentDate,
    issummary: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this
    let merchantShopId = wx.getStorageSync('merchantShopId');
    let branchId = wx.getStorageSync('branchId');
    let branchName = wx.getStorageSync('branchName');

    wx.setNavigationBarTitle({
      title: branchName + "-数据展示"
    });
    this.loadData(branchId);
  },

  loadData() {
    const that = this;
    let merchantShopId = wx.getStorageSync('merchantShopId');
    let branchId = wx.getStorageSync('branchId');
    const {
      date1,
      date2
    } = this.data;
    const reqData = {
      "sql_id": "ORDER-ITEM-001",
      "params": {
        "shopId": merchantShopId,
        "branchID": branchId,
        "startTime": date1 + " 00:00",
        "endTime": date2 + " 23:59"
      },
      "page_num": 1,
      "page_size": 9999
    }
    this.setData({
      infoStatText: "加载中"
    });
    ypRequest.post('https://binguoai.com/api/wxapp/openapi/iSqlquery', reqData).then(resData => {
      const results = resData.results || [];
      // results 
      this.data.alllist = results;
      this.setData({
        alllist: results,
        infoStatText: results.length ? "全部加载完毕" : "空"
      });
      this.handleData();

    }).catch(err => {
      console.log('err=>', err);
      this.setData({
        infoStatText: "加载失败"
      });
    })
  },
  handleData() {
    const alllist = this.data.alllist;
    const issummary = this.data.issummary;

    let resList = alllist;
    let temObj = {};
    // 如果是汇总那就是按名称组合来
    if (issummary) {
      alllist.forEach(item => {
        const curr = temObj[item.productName];
        if (curr) {
          curr.total_count += item.total_count;
          curr.total_amount += item.total_amount;
        } else {
          temObj[item.productName] = item
        }
      });
      resList = Object.values(temObj);
      resList.sort((a, b) => {
        return a.total_count - b.total_count < 0 ? 1 : -1;
      })
    }


    // 如果不按那就 直接展示
    this.setData({
      list: resList
    })

  },
  handleChange(e) {
    const index = e.target.dataset.index;
    let date1 = currentDate,
      date2 = currentDate;
    let date_0 = new Date(currentDate);
    let date_1 = new Date(currentDate);
    date_1.setDate(date_1.getDate() - 1);
    let date_2 = new Date(currentDate);
    date_2.setDate(date_2.getDate() - 2);
    let date_3_0 = new Date(currentDate);
    date_3_0.setDate(1);
    let date_3_1 = new Date(currentDate);
    date_3_1.setMonth(date_3_1.getMonth() + 1);
    date_3_1.setDate(0);

    const datelist = [
      [date_0, date_0],
      [date_1, date_1],
      [date_2, date_2],
      [date_3_0, date_3_1],
    ];
    this.setData({
      indexItem: index,
      date1: Formatter.format(datelist[index][0], 'YYYY-MM-DD'),
      date2: Formatter.format(datelist[index][1], 'YYYY-MM-DD'),
    });
    this.loadData();
  },
  bindDateChange(e) {
    const key = e.currentTarget.dataset.key;
    const selectTime = e.detail.value;
    let date2 = this.data.date2;
    if (key == '1') {
      // 获得三个月后的时间
      const cycle = new Date(selectTime);
      cycle.setMonth(cycle.getMonth() + 3);
      // 三个月后时间和当前时间对比 不能超过当前时间的三个月之后
      const isEnough = cycle.getTime() > new Date(currentDate).getTime();
      // 获取三个月后的时间且不超过当前时间的节点 为 最终时间
      const dateEnd = isEnough ? currentDate : Formatter.format(cycle, 'YYYY-MM-DD');
      // 当前时间是否大于最终时间
      const isGreaterthan = cycle.getTime() < new Date().getTime(date2);
      // 如果大于 时间间隔的后一位就为 最终时间
      date2 = isGreaterthan ? dateEnd : date2;
      // 如果 时间间隔的后一位 小于 前一位 那么date2 就是 前一位的值
      date2 = new Date(date2).getTime() < new Date(selectTime).getTime() ? selectTime : date2;
      // 更新视图
      this.setData({
        date1: selectTime,
        dateEnd: dateEnd,
        date2: date2,
        indexItem: -1,
      })
    } else if (key == '2') {
      this.setData({
        date2: e.detail.value,
        indexItem: -1,
      })
    }
    this.loadData();
  },
  handleChangeCheckbox(e) {
    console.log('e', e, e.detail.value);
    this.setData({
      issummary: e.detail.value && e.detail.value.length > 0,
    });
    this.handleData();
  }
})