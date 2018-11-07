/**
 * canvas画图工具
 */
/**
 * 重置画板
 * @param context
 * @param canvasWidth
 * @param canvasHeight
 * @param bgColor
 */
function clearCanvas(context, canvasWidth, canvasHeight, bgColor) {
    context.clearRect(0, 0, canvasWidth, canvasHeight);  // 重设画板
    context.setFillStyle(bgColor || '#FFFFFF');  // 底色
    context.fillRect(0, 0, canvasWidth, canvasHeight);
}

/**
 * 下载文件
 * @param url
 * @param retry
 * @param success
 * @param fail
 */
function downloadFile(url = '', retry, success, fail) {
    wx.downloadFile({
        url: url,
        success: function(res) {
            if (res.statusCode == 200) {
                success && success(res);
            } else {
                if (retry) {
                    downloadFile(url, false, success, fail); // 传递false，只重试一次
                } else {
                    fail && fail();
                }
            }
        },
        fail: function(err) {
            console.log(err);
            if (retry) {
                downloadFile(url, backupUrl, false, success, fail);
            } else {
                fail && fail(err);
            }
        },
    });
}

/**
 * 保存图片到临时文件
 * @param canvasId
 * @param canvasW
 * @param canvasH
 * @param retry
 * @param success
 * @param fail
 */
function saveImage(canvasId, canvasW, canvasH, retry, success, fail) {
    wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: canvasW,
        height: canvasH,
        destWidth: canvasW,
        destHeight: canvasH,
        canvasId: canvasId,
        success: function(res) {
            success && success(res.tempFilePath);
        },
        fail: function(err) {
            if (retry) {
                saveImage(canvasId, canvasW, canvasH, false, success, fail);
            } else {
                fail && fail(err);
            }
        },
    });
}

/**
 * 绘制多行文案
 * @param context
 * @param text
 * @param fontSize 字体大小
 * @param color 颜色
 * @param x 坐标x
 * @param y 坐标y
 * @param isBold 粗体
 * @param maxLine 最大行数
 * @param width 每行宽度
 * @param lineSpacing 行距
 */
function drawTextWrap(context, text, fontSize, color, x, y, isBold, maxLine = 1, width, lineSpacing = 5) { // eslint-disable-line
    try {
        let textList = [];
        // 如果包含数字和英文会计算不准，好像旧版的微信sdk有点问题，这里只考虑1.9.2以上版本
        textList = getTextLine(context, text, fontSize, width);

        let rowSize = textList.length;
        for (let i = 0; i < rowSize; i++) {
            let yNew = y + i * (fontSize + lineSpacing);
            let lineText = textList[i];
            if (i < maxLine) {
                // 要大于最大行数，且绘制最后一行
                if (rowSize > maxLine && i === maxLine - 1) {
                    lineText = lineText.substring(0, lineText.length - 2) + '...';
                }
                drawText(context, lineText, fontSize, color, x, yNew, isBold);
            }
        }
    } catch (e) {
        console.log('drawTextWrap err', e);
        drawText(context, text, fontSize, color, x, y, isBold);
    }
}


function drawText(context, text, fontSize, color, x, y, isBold) {
    if (!text) {
        return;
    }
    context.setFillStyle(color || '#000000'); // 颜色
    context.setFontSize(fontSize || 28); // 大小
    context.setTextBaseline('top'); // 设置水平对齐位置
    // if (isBold) {
    //     context.font = 'bold';
    // } else {
    //     context.weight = 'normal';
    // }
    context.fillText(text, x, y);
}

/**
 * 画圆形图片
 * @param img
 * @param x
 * @param y
 * @param r 半径
 */
function drawImg(context, filePath, x, y, width, height, isCircle) {
    if (isCircle) {
        let r = width / 2;
        let cx = x + r;
        let cy = y + r;
        context.save();
        context.beginPath();
        context.arc(cx, cy, r, 0, 2 * Math.PI);
        context.setStrokeStyle('#999999');
        context.stroke();
        context.clip();
        context.drawImage(filePath, x, y, width, width);
        context.restore();
    } else {
        context.drawImage(filePath, x, y, width, height);
    }
}

/**
 * 把view绘制到vanvas，然后保存图片到临时路径
 * @param context
 * @param callback
 */
function drawViewToCanvas(context, callback) {
    // 注意：1.7.0以上版本才有callback
    context.draw(false, () => {
        setTimeout(() => {
            callback && callback();
        }, 200);
    });
}

/**
 * 计算text多少行
 * @param context
 * @param text
 * @param fontSize
 * @param width
 * @returns {Array}
 */
function getTextLine(context, text, fontSize, width) {
    context.setFontSize(fontSize); // 先设置字体大小
    let textList = [];
    let lineText = '';
    let charList = text.split('');
    for (let i = 0; i < charList.length; i++) {
        let lineTextLast = lineText + charList[i];
        let metrics = context.measureText(lineTextLast); // 计算当前字符串的宽度
        if (metrics.width > width && i > 0) {
            textList.push(lineText);
            lineText = charList[i]; // 下一行的启始为刚计算的最后一个字符
        } else {
            lineText = lineTextLast; // 没有超过最大width就继续累加
        }
        if (i == charList.length - 1) {
            textList.push(lineText);
        }
    }
    return textList;
}

function getTextWidth(context, text, fontSize) {
    let charWidth = fontSize / 2;
    let len = 0;
    for (let x = 0; x < text.length; x++) {
        if (text.charCodeAt(x) > 128) {
            len += 2;
        } else {
            len += 1;
        }
    }
    return len * charWidth;
}

function fillRect(context, color, x, y, width, height) {
    context.setFillStyle(color);
    context.fillRect(x, y, width, height);
}

module.exports = {
    clearCanvas,
    downloadFile,
    saveImage,
    drawText,
    drawTextWrap,
    drawImg,
    drawViewToCanvas,
    getTextWidth,
    fillRect,
};
