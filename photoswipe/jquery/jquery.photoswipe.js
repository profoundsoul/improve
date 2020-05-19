(function($){
    var html ='<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true">\
            <div class="pswp__bg"></div>\
            <div class="pswp__scroll-wrap">\
                <div class="pswp__container">\
                    <div class="pswp__item"></div>\
                    <div class="pswp__item"></div>\
                    <div class="pswp__item"></div>\
                </div>\
                <div class="pswp__ui pswp__ui--hidden">\
                    <div class="pswp__top-bar">\
                        <div class="pswp__counter"></div>\
                        <div class="pswp__preloader">\
                            <div class="pswp__preloader__icn">\
                                <div class="pswp__preloader__cut">\
                                    <div class="pswp__preloader__donut"></div>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                    <div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">\
                        <div class="pswp__share-tooltip"></div>\
                    </div>\
                    <div class="pswp__caption">\
                        <div class="pswp__caption__center"></div>\
                    </div>\
                </div>\
            </div>\
        </div>\
    ';

    var generateIncreasingUUID = function(prefix){
        var start = 10000;
        return function(){
            return (prefix || '') + start++;
        }
    };
    function isDomElement(obj){
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

    var generateThumbBoundsFn = function(selector){
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

    var getPhotoSwipeUUID = generateIncreasingUUID('photoswipe_');

    var PhotoSwipeClass = function(root, options){
        this.options = options;
        this.$root = $(root);
        this.init();
    };

    PhotoSwipeClass.prototype = {
        init: function(){
            var _this = this;
            this.createRootElement();
            this.$root.off('click.photoswipe', this.options.imgSelector);
            this.$root.on('click.photoswipe', this.options.imgSelector, function(e){
                var target = $(e.currentTarget);
                var imgElement = _this.getImageElement();
                var index = 0;
                imgElement.each(function(idx, item){
                    if(target[0] == item){
                        index = idx;
                        return false;
                    }
                })
                _this.show(index);
            })
        },
        create: function(index){
            this.options.getThumbBoundsFn = generateThumbBoundsFn(this.options.imgSelector);
            this.options.index = index;
            this.photoswipe = new PhotoSwipe(this.$el.get(0), window.PhotoSwipeUI_Default, this.options.imgList, this.options);
            var _this = this;
            this.photoswipe.listen('gettingData', function (index, item) {
                if (!item.w || !item.h || item.w < 1 || item.h < 1) {
                    _this.loadImage(item, function(){
                        _this.photoswipe.updateSize(true)
                    });
                }
            })
            this.photoswipe.init()
            this.photoswipe.listen('close', () => {
                setTimeout(function(){
                    // _this.$el.remove();
                }, _this.options.hideAnimationDuration || 0)
            })
            console.log('1111');
        },
        createRootElement: function(){
            this.$uuid = getPhotoSwipeUUID();
            this.$el = $(html);
            this.$el.attr('id', this.$uuid);
            $(document.body).append(this.$el);
        },
        setImageOptions: function(arr){
            this.options.imgList = arr;
        },
        show: function(index){
            var _this = this;
            if(this.options.isAutoCollectImage){
                this.setImageOptions(this.collectImageList());
            }

            // 为避免动画不流畅和衔接不上，对msrc与src做一个兼容
            // by linq at 2020/05/15
            this.options.imgList.forEach(function(item){
                if(item.src && !item.msrc){
                    item.msrc = item.src;
                }
                if(item.msrc && item.src){
                    item.src = item.msrc;
                }
            });

            var showItem = this.options.imgList[index];
            if (!showItem.w || !showItem.h || showItem.w < 5 || showItem.h < 5) {
                _this.loadImage(showItem, function(){
                    _this.create(index);
                })
            } else {
                this.create(index)
            }
        },
        loadImage: function(item, fn){
            var _this = this;
            const img = new Image()
            img.onload = function () {
                item.w = this.width
                item.h = this.height
                typeof fn === 'function' && fn.call(_this);
            }
            img.src = item.src
        },
        getImageElement: function(){
            return $(document.body).find(this.options.imgSelector);
        },
        collectImageList: function(){
            var result = [];
            var allImages = this.getImageElement();
            allImages.each(function(index, item){
                var target = $(item);
                var url = target.attr('src');
                var title = target.attr('title');
                if(target.attr('src')){
                    var obj = {
                        src: url
                    };
                    if(title){
                        obj.title = title;
                    }
                    // var w = target.width();
                    // var h = target.height();
                    obj.w = 0;
                    obj.h = 0;
                    if(target.attr('msrc')){
                        obj.msrc = target.attr('msrc');
                    }
                    result.push(obj);
                }
            })
            return result;
        },

    };
    PhotoSwipeClass.prototype.constructor = PhotoSwipeClass;

    var defaults = {
        history: false,
        shareEl: false,
        fullscreenEl: false,
        tapToClose: true,
        tapToToggleControls: false,
        clickToCloseNonZoomable: true,
        zoomEl: false,
        arrowEl: false,
        bgOpacity: 0.85,
        spacing: 0,
        maxSpreadZoom: 5,
        index: 0,
        /**
         * src,msrc, w, h, title四个属性
         */
        imgList: [],
        hideAnimationDuration: 333,
        imgSelector: 'img',
        isAutoCollectImage: false
    };

    $.fn.photoswipe = function(options){
        options = $.extend(true, {}, defaults, options || {});
        new PhotoSwipeClass($(this), options);
    }

})(window.jQuery || window.Zepto)