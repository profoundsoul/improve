let isDomElement = (obj)=>{
    return obj instanceof HTMLElement;
}


// 判定obj是否是一个类数组对象
function isArrayLike( obj ) {
    if( obj && typeof obj === "object" &&	      // obj非null、undefined等 obj是对象
        isFinite(obj.length) && 	              // obj.length是有限数值
        obj.length >= 0 &&	                      // obj.length为非负数
        obj.length === Math.floor(obj.length) &&  // obj.length是整数
        obj.length < 4294967296)	              // obj.length < 2^32
        return true;
    else
        return false;
}

export default {
    generateThumbBoundsFn(selector){
        return function getThumbBoundsFn(index) {
            // find thumbnail element
            var thumbnail = '';
            if(isDomElement(selector)){
                thumbnail = selector;
            }else if(isArrayLike(selector) || Array.isArray(selector)){
                if(selector.length>index){
                    thumbnail = selector[index];
                }
            }else{
                var thumbnailNodeList =  document.querySelectorAll(selector);
                if(thumbnailNodeList && thumbnailNodeList.length && thumbnailNodeList.length > index){
                    thumbnail = thumbnailNodeList[index];
                }
            }
            if(thumbnail){
                // get window scroll Y
                var pageYScroll = window.pageYOffset || document.documentElement.scrollTop; 
                // optionally get horizontal scroll
            
                // get position of element relative to viewport
                var rect = thumbnail.getBoundingClientRect(); 
            
                // w = width
                return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
            }
            return {x:0, y:0, w: 50};
        }
    }
}