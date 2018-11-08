Page({

    /**
     * 页面的初始数据
     */
    data: {
        shareInfoA: {}, // 第一个分享按钮
        shareInfoB: {}, // 第二个分享按钮
        img1: 'https://raw.githubusercontent.com/w3cmark/wechat-app-demo/master/miniprogram/images/c260f7ably1fu94bvbb66j20v90kmk21.jpg',
        img2: 'https://raw.githubusercontent.com/w3cmark/wechat-app-demo/master/miniprogram/images/c260f7abgy1fs79887cbcj20qz0yohdu.jpg',
        userInfo: null,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {
        this.getUserInfo();
        this.assemblyParam();
    },
    onGotUserInfo: function (e) {
        // 点击授权按钮获取用户信息
        wx.setStorage({
            key: 'userInfo',
            data: e.detail.userInfo
        });
        this.data.userInfo = e.detail.userInfo;
        this.setData({
            userInfo: this.data.userInfo
        });
    },
    getUserInfo: function () {
        // 获取用户信息
        try {
            this.data.userInfo = wx.getStorageSync('userInfo');
            this.setData({
                userInfo: this.data.userInfo
            });
        } catch (e) {
            console.log(e);
        }
    },
    assemblyParam: function () {
        // 组装好友分享图需要的画图参数
        let shareFriendtitle = {
            type: 'text',
            content: '$200',
            style: '',
            x: 20,
            y: 0,
        };
        // 第一个分享按钮
        let shareFriendInfoA = {
            width: 375,
            height: 667,
            content: [
                shareFriendtitle,
                {
                    type: 'image',
                    src: this.data.img1,
                    // width: 335,
                    // height: 335,
                    x: 20,
                    y: 45,
                },
            ]
        };
        // 自定义画图得到的是临时图片路径，开发者工具貌似显示不了，可以用真机测试。
        this.selectComponent('#Jshare').onShareAppMessage(shareFriendInfoA, (imgUrl) => {
            this.data.shareImgUrl = imgUrl;
        });

        // 组装朋友圈分享图需要的画图参数
        let avatar = {
            type: 'image',
            src: this.data.userInfo.avatarUrl,
            width: 45,
            height: 45,
            x: 20,
            y: 35,
        };
        let nickName = {
            type: 'text',
            content: this.data.userInfo.nickName,
            style: '',
            x: 80,
            y: 35,
        };
        let pic = {
            type: 'image',
            src: this.data.img1,
            // width: 335,
            // height: 335,
            x: 20,
            y: 125,
        };
        let title = {
            type: 'text',
            content: '大家好，我是刘亦菲，哈哈',
            style: '',
            x: 20,
            y: 565,
        };
        // 第一个分享按钮
        let shareInfoA = {
            width: 375,
            height: 667,
            content: [
                avatar,
                nickName,
                pic,
                title
            ]
        };

        // 第二个分享按钮
        let shareInfoB = {
            width: 375,
            height: 667,
            content: [
                avatar,
                nickName,
                {
                    type: 'image',
                    src: this.data.img2,
                    // width: 335,
                    // height: 335,
                    x: 20,
                    y: 125,
                },
                title
            ]
        };
        this.setData({
            shareInfoA,
            shareInfoB,
            shareFriendInfoA
        });
    },
    onShareAppMessage: function (res) {
        return {
            title: '啦啦啦，大家好，我是刘亦菲～',
            path: 'pages/share/share',
            imageUrl: this.data.shareImgUrl || this.data.img2
        };
    }
});