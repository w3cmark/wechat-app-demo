// miniprogram/pages/share/share.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        shareInfo: {},
        img1: 'https://raw.githubusercontent.com/w3cmark/wechat-app-demo/master/miniprogram/images/c260f7ably1fu94bvbb66j20v90kmk21.jpg',
        img2: 'https://raw.githubusercontent.com/w3cmark/wechat-app-demo/master/miniprogram/images/c260f7abgy1fs79887cbcj20qz0yohdu.jpg',
        userInfo: null,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function() {
        this.getUserInfo();
        this.assemblyParam();
    },
    onGotUserInfo: function(e) {
        // 点击授权按钮获取用户信息
        wx.setStorage({
            key: 'userInfo',
            data: e.detail.userInfo
        })
        this.data.userInfo = e.detail.userInfo;
        this.setData({
            userInfo: this.data.userInfo
        })
    },
    getUserInfo: function() {
        // 获取用户信息
        try {
            this.data.userInfo = wx.getStorageSync('userInfo');
            this.setData({
                userInfo: this.data.userInfo
            })
        } catch (e) {
            console.log(e);
        }
    },
    assemblyParam: function() {
        // 组装需要画图的参数
        let avatar = {
            type: 'image',
            src: this.data.userInfo.avatarUrl,
            width: 45,
            height: 45,
            x: 20,
            y: 35,
        }
        let nickName = {
            type: 'text',
            content: this.data.userInfo.nickName,
            style: '',
            x: 80,
            y: 35,
        }
        let pic = {
            type: 'image',
            src: this.data.img1,
            // width: 335,
            // height: 335,
            x: 20,
            y: 125,
        }
        let title = {
            type: 'text',
            content: '大家好，我是刘亦菲，哈哈',
            style: '',
            x: 20,
            y: 565,
        }
        let canvasId = 'friendCanvasId';
        let shareInfo = {
            canvasId: canvasId,
            width: 375,
            height: 667,
            content: [
                avatar,
                nickName,
                pic,
                title
            ]
        }
        this.setData({
            shareInfo
        })
    }
})