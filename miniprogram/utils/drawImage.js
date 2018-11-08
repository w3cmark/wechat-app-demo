/**
 * 画图
 */
const drawUtil = require('./drawUtil');

/**
 * 画图传参格式
 * data: {
    width: 375, // 画布宽度
    height: 667, // 画布高度
    content: [ //画布内容，支持图片和文案类型，数组有多少就画多少
        {
            type: 'image', // 图片类型
            src: this.data.img1,
            width: '',
            height: '',
            x: '',
            y: '',
        },
        {
            type: 'text', // 文案类型
            content: '大家好，我是刘亦菲，哈哈',
            style: '',
            x: '',
            y: '',
        }
    ]
   }
 */
module.exports = function (data, successCallback, failCallback) {
    if (!data) {
        failCallback && failCallback();
    }

    const canvasId = 'shareCanvas'; // 画板id
    const canvasContext = data.canvasContext;
    const context = wx.createCanvasContext(canvasId, canvasContext);
    let canvasW = data.width;
    let canvasH = data.height;
    let saveW = canvasW * 2;
    let saveH = canvasH * 2;
    let imgTotalCount = 0; // 默认图片总数量
    let downLoadImgCount = 0; // 当前下载图片数量

    data.content.forEach(element => {
        if (element && element.type === 'image') {
            imgTotalCount++;
        }
    });

    /**
     * 下载需要绘制的图片
     * @param imgUrl 图片地址
     * @param x 坐标x
     * @param y 坐标y
     * @param width 图片宽度
     * @param height // 图片高度
     * @param isCircle 是否是圆图
     * @param callback
     */
    let downImage = function (imgUrl, x, y, width, height, isCircle) { // eslint-disable-line
        // 先下载图片在画到canvas上
        drawUtil.downloadFile(imgUrl, true,
            res => {
                if (width && height) {
                    // 如果参数有宽高
                    drawViewToCanvas(res.tempFilePath, x, y, width, height, isCircle);
                } else {
                    // 如果没传，就获取图片实际尺寸
                    wx.getImageInfo({
                        src: res.tempFilePath,
                        success: (re) => {
                            let new_w = re.width * (335 / re.width);
                            let new_h = re.height * (335 / re.width);
                            drawViewToCanvas(res.tempFilePath, x, y, new_w, new_h, isCircle);
                        },
                        fail: () => {
                            failCallback && failCallback(); // 如果图片信息获取失败，直接返回失败
                        }
                    });
                }

            },
            () => {
                failCallback && failCallback(); // 如果下载图片失败，直接返回加载失败
            }
        );
    };

    /**
     * 绘制图片到canvas
     */
    let drawViewToCanvas = function(imgUrl, x, y, width, height, isCircle) {
        drawUtil.drawImg(context, imgUrl, x, y, width, height, isCircle);
        downLoadImgCount++;
        if (downLoadImgCount !== imgTotalCount) {
            return;
        }
        // 把view绘制到vanvas，然后保存图片到临时路径
        drawUtil.drawViewToCanvas(context, () => {
            saveImage();
        });
    };

    /**
     * 绘制文案
     */
    let drawText = function (text, fontSize, color, x, y, isBold) {
        drawUtil.drawText(context, text, fontSize, color, x, y, isBold);
    };

    let drawTextWrap = function (text, fontSize, color, x, y, isBold, maxLine, width, lineSpacing) { // eslint-disable-line
        drawUtil.drawTextWrap(context, text, fontSize, color, x, y, isBold, maxLine, width, lineSpacing);
    };

    /**
     * 保存图片获取临时path
     */
    const saveImage = function () {
        drawUtil.saveImage(canvasId, saveW, saveH, true,
            tempFilePath => {
                successCallback && successCallback(tempFilePath);
            },
            err => {
                failCallback && failCallback(err);
            },
            canvasContext
        );
    };

    // 重置画板
    drawUtil.clearCanvas(context, canvasW, canvasH, '#FFFFFF');

    // 商品图
    // 默认方图 rectangleType = s
    // let productImgX = 20;
    // let productImgY = 125;
    // let imageW = 335; // 默认宽度
    // let imageH = 335; // 默认高度

    // let productImg1 = data.previewImages;
    // downImage(productImg1, productImgX, productImgY, '', '', false,
    //     () => {

    //     });

    // // 商品名称
    // drawTextWrap(data.title, 15, '#000000', 20, 565, false, 2, 190, 7.5);

    // // 二维码
    // // downImage(data.qrCodeUrl, 263, 518, 90, 90);

    // // 长按二维码tip
    // drawText('长按识别查看商品', 12, '#888888', 263, 623);

    data.content.forEach(element => {
        if (element && element.type === 'image') {
            // 图片
            downImage(element.src, element.x, element.y, element.width, element.height);
        } else if (element && element.type === 'text') {
            // 文案
            drawText(element.content, '', '#888888', element.x, element.y);
        }
    });
};
