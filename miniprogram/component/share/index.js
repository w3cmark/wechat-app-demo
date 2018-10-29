// component/share/share.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    logged: false,
    showSharePickPop: true, // 是否显示选择弹层
    showTempImagePop: false, // 是否显示分享到朋友圈的图片弹层
    tempImage: '', // 绘制的分享图
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onGetUserInfo: function(e) {
      if (!this.logged && e.detail.userInfo) {
        console.log(e.detail.userInfo);
      }
    },
    onShareButton: function() {
      // 分享面板激活回调

    },
    onShareClose: function() {
      // 关闭分享面板回调

    },
    onShareAppMessage: function() {
      // 点击分享到好友回调

    },
    onShareTimeline: function() {
      // 点击分享到朋友圈回调

    },
    onWritePhotosAlbum: function(){
      // 点击保存到相册回调

    }
  }
})
