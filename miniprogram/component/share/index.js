const drawImage = require('../../utils/drawImage');

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        shareInfo: {
            type: Object,
            value: null,
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        showSharePickPop: false, // 是否显示选择弹层
        showCirclePoup: false, // 是否显示分享到朋友圈的图片弹层
        circleImage: '', // 绘制的朋友圈分享图
        friendImage: '', // 绘制的朋友圈分享图
        animationData: {
            mainPoup: {}, // 分享面板动画
            maskPoup: {}, // 半透明遮罩层动画
            circlePoup: {} // 分享到朋友圈弹层动画
        },
    },
    created: function () {
        // 一些不需要暴露到view层的数据
        this.data.scopeName = 'scope.writePhotosAlbum'; // 授权名
        this.data.openWritePhotosAlbumText = '检测到您未打开微信保存图片到相册，开启后即可保存图片'; // 保存到相册授权被拒绝
        this.data.drawImgFailText = '图片生成失败，请关闭弹窗重试'; // 画图失败
        this.data.saveImgSuccessText = '保存图片成功，可以去朋友圈分享啦'; // 保存图片成功
        this.data.saveImgFailText = '图片保存失败，请确认授权后再试'; // 保存图片失败
        this.createAnimation();
    },
    /**
     * 组件的方法列表
     */
    methods: {
        /**
         * 创建动画
         */
        createAnimation() {
            // 分享面板动画
            this.mainPoupAnimation = wx.createAnimation({
                duration: 400,
                timingFunction: 'ease-out',
            });
            // 半透明遮罩层动画
            this.maskPoupAnimation = wx.createAnimation({
                duration: 400,
                timingFunction: 'ease-out',
            });
            // 分享朋友圈动画
            this.circlePoupAnimation = wx.createAnimation({
                duration: 400,
                timingFunction: 'ease-out',
            });
        },
        /**
         * toast 提示
         * @param title 提示内容
         * @param icon 提示icon
         * @param duration 持续时间
         */
        showToast(title, icon = 'none', duration = 2000) {
            wx.showToast({
                title,
                icon,
                duration
            });
        },
        /**
         * 监听 点击分享按钮
         */
        onShare() {
            this.mainPoupAnimation.translateY(0).step();
            this.maskPoupAnimation.opacity(1).step();

            this.setData({
                showSharePickPop: true,
            });
            setTimeout(() => {
                this.setData({
                    'animationData.mainPoup': this.mainPoupAnimation.export(),
                    'animationData.maskPoup': this.maskPoupAnimation.export(),
                });
            }, 20);
        },
        /**
         * 监听 点击关闭分享弹层按钮
         */
        onClosePopup() {
            if (this.data.showCirclePoup) {
                this.onCloseCirclePopup();
                return;
            }
            this.mainPoupAnimation.translateY('100%').step();
            this.maskPoupAnimation.opacity(0).step();

            this.setData({
                'animationData.mainPoup': this.mainPoupAnimation.export(),
                'animationData.maskPoup': this.maskPoupAnimation.export(),
            });
            setTimeout(() => {
                this.setData({
                    showSharePickPop: false,
                });
            }, 400);
        },
        /**
         * 监听 点击分享到好友按钮
         */
        onShareAppMessage(shareInfo, callback) {
            // 开始生成图片
            if (!this.data.friendImage) {
                this.drawFriendImg(shareInfo, (imgUrl) => {
                    callback && callback(imgUrl);
                });
            }
        },
        /**
         * 绘制好友分享图
         */
        drawFriendImg(shareInfo, callback) {

            // 分享信息有误
            if (!shareInfo) {
                console.error('shareInfo is null');
                return;
            }

            // 判断是否有canvas生成的图片缓存
            if (!this.data.tempDrawFriendImgUrl) {
                // wx.showLoading({ title: '图片生成中...', });
                // 设置二维码url
                // shareInfo.qrCodeUrl = sharePanelUtils.getQrCodeUrlProductDetail(shareInfo.productId, shareInfo.brandId);
                // shareInfo.qrCodeUrl = '';
                shareInfo.canvasContext = this;
                // canvas上绘制图片
                drawImage(shareInfo,
                    tempDrawFriendImgUrl => {
                        this.data.tempDrawFriendImgUrl = tempDrawFriendImgUrl; // 记录当前canvas保存的临时文件
                        callback && callback(tempDrawFriendImgUrl);
                        // wx.hideLoading();
                    },
                    () => {
                        // wx.hideLoading();
                        // this.showToast(this.data.drawImgFailText)
                        // this.closeFriendCircle();
                    });
            } else {
                callback && callback(this.data.tempDrawFriendImgUrl);
            }
        },
        /**
         * 监听 点击分享到朋友圈按钮
         */
        onShareCircle() {
            this.circlePoupAnimation.translateY(0).step();
            this.setData({
                showCirclePoup: true,
            });

            setTimeout(() => {
                this.setData({
                    'animationData.circlePoup': this.circlePoupAnimation.export(),
                });
            }, 20);

            // 开始生成图片
            if (!this.data.circleImage) {
                this.drawCircleImg();
            }
        },
        /**
         * 监听 点击关闭分享到朋友圈弹层按钮
         */
        onCloseCirclePopup() {
            this.circlePoupAnimation.translateY('100%').step();

            this.setData({
                'animationData.circlePoup': this.circlePoupAnimation.export(),
            });
            setTimeout(() => {
                this.setData({
                    showCirclePoup: false,
                });
            }, 400);
        },
        /**
         * 监听 点击保存到相册按钮
         */
        onSavePhotos() {
            if (!this.data.circleImage) {
                return false;
            }
            const openSetting = (successCallback, failCallback) => {
                wx.openSetting({
                    success: res => {
                        if (res && res.authSetting && res.authSetting[this.data.scopeName]) {
                            successCallback && successCallback();
                        } else {
                            failCallback && failCallback();
                        }
                    },
                    fail: () => {
                        failCallback && failCallback();
                    }
                });
            };

            // 是否授权过
            let authorizeWritePhotosAlbum = null;
            try {
                authorizeWritePhotosAlbum = wx.getStorageSync('authorizeWritePhotosAlbum');
            } catch (e) {
                // Do something when catch error
                console.log(e);
            }

            if (!authorizeWritePhotosAlbum) {
                // 询问授权
                wx.authorize({
                    scope: this.data.scopeName,
                    success: (res) => {
                        // console.log('授权认证成功' + JSON.stringify(res));
                        this.saveImage();
                    },
                    fail: () => {
                        wx.setStorage({
                            key: 'authorizeWritePhotosAlbum',
                            data: 'fail'
                        });
                    }
                });
            } else if (authorizeWritePhotosAlbum === 'success') {
                // 授权成功
                this.saveImage();
            } else {
                // 授权过但被拒绝
                openSetting(() => {
                    this.saveImage();
                }, () => {
                    // 失败
                    this.showToast(this.data.saveImgFailText);
                });
            }

        },
        /**
         * 保存到相册按钮
         */
        saveImage() {
            wx.setStorage({
                key: 'authorizeWritePhotosAlbum',
                data: 'success'
            });
            wx.saveImageToPhotosAlbum({
                filePath: this.data.circleImage,
                success: () => {
                    this.showToast(this.data.saveImgSuccessText, 'success');
                },
                fail: () => {
                    this.showToast(this.data.saveImgFailText, 'success');
                }
            });
        },
        /**
         * 绘制朋友圈分享图
         */
        drawCircleImg() {
            let shareInfo = this.data.shareInfo;

            // 分享信息有误
            if (!shareInfo) {
                console.error('shareInfo is null');
                return;
            }

            // 判断是否有canvas生成的图片缓存
            if (!this.data.tempDrawImgUrl) {
                wx.showLoading({ title: '图片生成中...', });
                // 设置二维码url
                // shareInfo.qrCodeUrl = sharePanelUtils.getQrCodeUrlProductDetail(shareInfo.productId, shareInfo.brandId);
                // shareInfo.qrCodeUrl = '';
                shareInfo.canvasContext = this;
                // canvas上绘制图片
                drawImage(shareInfo,
                    tempDrawImgUrl => {
                        this.data.tempDrawImgUrl = tempDrawImgUrl; // 记录当前canvas保存的临时文件
                        this.setShareImgPath(tempDrawImgUrl);
                        wx.hideLoading();
                    },
                    () => {
                        wx.hideLoading();
                        this.showToast(this.data.drawImgFailText);
                        // this.closeFriendCircle();
                    });
            } else {
                this.setShareImgPath(this.data.tempDrawImgUrl);
            }
        },
        /**
         * 设置canvas生成的图片
         * @param path
         */
        setShareImgPath(path) {
            if (!path) {
                return;
            }
            this.setData({
                circleImage: path
            });
        },
        /**
         * 关闭朋友圈分享
         */
        closeFriendCircle() {
            this.setData({
                showCirclePoup: false,
                shareImgPath: '' // 清空内容
            });
        }
    }
});
