// 设计稿的像素比例，默认值为2
let designPixelRatio = 2;
const devicePixelRatio = window.devicePixelRatio;


export const setDesignPixelRatio = function (ratio) {
  designPixelRatio = ratio;
};

export const  getDevicePixelRatio=function () {
  return devicePixelRatio;
}

export let convert = function(desginPixel) {
  return devicePixelRatio * desginPixel / designPixelRatio;
}

export let canvasBlurryPolyfill = function (ctx, canvas) {
  const backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
    ctx.mozBackingStorePixelRatio ||
    ctx.msBackingStorePixelRatio ||
    ctx.oBackingStorePixelRatio ||
    ctx.backingStorePixelRatio || 1;

  var ratio = devicePixelRatio / backingStoreRatio;
  if (devicePixelRatio !== backingStoreRatio) {
    var oldWidth = canvas.width;
    var oldHeight = canvas.height;

    canvas.width = oldWidth * ratio;
    canvas.height = oldHeight * ratio;

    canvas.style.width = oldWidth + 'px';
    canvas.style.height = oldHeight + 'px';

    ctx.scale(ratio, ratio);
  }
}


