// pages/comment/components/CommonComponent/index.js
const {
  randomInt,
  Formatter
} = require('../../../../lib/utils');
const YpRequest = require('../../../../lib/ypRequest');

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object,
    },
    readOnly: {
      type: Boolean,
    }
  },

  attached() {
    if (this.data.readOnly) {
      console.log('this',this)
      if (this.data.item.files) {
        const fileList = this.data.item.files.map(url => {
          return {
            url
          };
        });
        this.setData({
          fileList
        });
      }

    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    fileList: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    updateFileListAndFileStatusByRandomItem(file) {
      const id = file.id;
      const fileList = this.data.fileList;
      const itemIndex = fileList.findIndex(item => item.id === id);
      if (itemIndex < 0) {
        fileList.push(file);
      } else {
        fileList.splice(itemIndex, 1, file);
      }
      this.setData({
        fileList: fileList
      });
    },
    fileListRemoveItemByIndex(index) {
      const fileList = this.data.fileList;
      fileList.splice(index, 1);
      this.setData({
        fileList: fileList
      });
    },
    // 事件交互
    onRateChange(e) {
      const rate = e.detail;
      this.$emit('score', rate);
    },
    handleTextareaChange(e) {
      console.log('e', e);
      const text = e.detail.value;
      this.$emit('content', text);
    },
    onAfterRead(e) {
      console.log('e.detail.file.path', e.detail.file.path);
      const path = e.detail.file.path;
      const fileObj = {
        id: randomInt(100000, 999999),
        url: path,
        status: 'uploading',
        message: '上传中',
      };
      wx.showLoading({
        title: '上传中',
        mask: true,
      });
      this.updateFileListAndFileStatusByRandomItem(fileObj);
      // TODO: 这里有点乱
      YpRequest.uploadFileQbox(path).then(res => {
        console.log(res);
        fileObj.status = "done";
        fileObj.message = "上传成功";
        fileObj.url = res;
        this.updateFileListAndFileStatusByRandomItem(fileObj);
        // item.files = this.getUploadSuccessFiles(code); // 更新图片列表
        this.$emit('files', this.data.fileList);
        // 触发更改
        wx.hideLoading();
      }).catch(e => {
        fileObj.status = "failed";
        fileObj.message = "上传失败";
        this.updateFileListAndFileStatusByRandomItem(fileObj);
        wx.hideLoading();
      });
    },
    onDeleteFile(e) {
      console.log('e', e);
      const index = e.detail.index;
      this.fileListRemoveItemByIndex(index);
      // item.files = this.getUploadSuccessFiles(code); // 更新图片列表
      // 触发更改
      this.$emit('files', this.data.fileList);
    },
    $emit(type, data) {
      this.triggerEvent('change', {
        type,
        target: this.data.item,
        value: data
      })
    }
  },
  filelistFilter(files) {
    return files;
  }
})