
const defaultOptions = {
    thresshold: 5,
    multiClicked: true,
    // 每次点击时间间隔，单位毫秒
    interval: 200,
    // 点击次数
    clickTimes: 10,
    longClicked: false,
    longClickedTime: 500,
    capture: false
};

const isSupportTouch = "ontouchend" in document ? true : false;

function touchAndClick(element, callback, options) {
    return new ClickedEvents(element, callback, options)
}

class ClickedEvents {
    constructor(element, callback, options) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
            if (!element) {
                console.warn(`Unknown element: document.querySelector(${element}) in clicked()`);
                return
            }
        }
        this.options = Object.assign({}, defaultOptions, options);
        this.events = {
            mousedown: (e) => this.mousedown(e),
            mouseup: (e) => this.mouseup(e),
            mousemove: (e) => this.mousemove(e),
            touchstart: (e) => this.touchstart(e),
            touchmove: (e) => this.touchmove(e),
            touchcancel: (e) => this.cancel(e),
            touchend: (e) => this.touchend(e)
        };
        if (isSupportTouch) {
            element.addEventListener('touchstart', this.events.touchstart, { passive: true, capture: this.options.capture });
            element.addEventListener('touchmove', this.events.touchmove, { passive: true, capture: this.options.capture });
            element.addEventListener('touchcancel', this.events.touchcancel, { capture: this.options.capture });
            element.addEventListener('touchend', this.events.touchend, { capture: this.options.capture });
        } else {
            element.addEventListener('mousedown', this.events.mousedown, { capture: this.options.capture });
            element.addEventListener('mouseup', this.events.mouseup, { capture: this.options.capture });
            element.addEventListener('mousemove', this.events.mousemove, { capture: this.options.capture });
        }
        // 多次点击定时器
        this.multiClickedTimeout = null;
        this.multiClickedCount = 0;
        /** 开始启动连续点击时的ScreenX和ScreenY */
        this.multiClickedScreenX = -1 * this.options.thresshold;
        this.multiClickedScreenY = -1 * this.options.thresshold;

        this.element = element;
        this.callback = callback;
    }

    destroy() {
        if (isSupportTouch) {
            this.element.removeEventListener('touchstart', this.events.touchstart, { passive: true });
            this.element.removeEventListener('touchmove', this.events.touchmove, { passive: true });
            this.element.removeEventListener('touchcancel', this.events.touchcancel);
            this.element.removeEventListener('touchend', this.events.touchend);
        } else {
            this.element.removeEventListener('mousedown', this.events.mousedown);
            this.element.removeEventListener('mouseup', this.events.mouseup);
            this.element.removeEventListener('mousemove', this.events.mousemove);
        }
    }

    touchstart(e) {
        if (this.down === true) {
            this.cancel();
        }else {
            if (e.touches.length === 1) {
                this.handleDown(e, e.changedTouches[0].screenX, e.changedTouches[0].screenY);
            }
        }
    }

    handleDown(e, x, y) {
        if (this.multiClickedTimeout) {
            // 是否已经开启了多次点击
            if (this.pastThreshhold(x, y)) {
                this.callback({ event: e, type: 'clicked' });
                this.cancel();
            } else {
                // 如果次数达到，就执行回调，否则让它继续点击
                if(this.multiClickedCount >= (this.options.clickTimes - 1)){
                    this.callback({ event: e, type: 'multi-clicked' });
                    this.cancel();
                }else{
                    this.clearMultiClickedTimeout();
                    this.multiClickedCount++;
                    this.multiClickedTimeout = setTimeout(() => this.multiClickedTimeoutHandler(), this.options.interval);
                }
            }
            // console.log(this.multiClickedCount, this.multiClickedScreenX, this.multiClickedScreenY);
        } else {
            // 假设开启长按、多次点击、点击；后续来处理取消和到底是哪个事假的情况.
            this.multiClickedScreenX = x;
            this.multiClickedScreenY = y;
            this.down = true;
            if (this.options.longClicked) {
                this.longClickedTimeout = setTimeout(() => this.longClicked(e), this.options.longClickedTime);
            }
        }
    }

    touchmove(e) {
        if (this.down) {
            if (e.touches.length !== 1) {
                this.cancel();
            } else {
                const x = e.changedTouches[0].screenX;
                const y = e.changedTouches[0].screenY;
                if (this.pastThreshhold(x, y)) {
                    this.cancel();
                }
            }
        }
    }

    cancel() {
        // 避免多点长按，此时应该清除多个多次点击
        this.resetMultiClicked();
        // 清楚长按定时器
        this.cancelLongClicked();
    }

    cancelLongClicked(){
        if (this.longClickedTimeout) {
            clearTimeout(this.longClickedTimeout);
            this.longClickedTimeout = null;
        }
        this.down = false;
    }

    touchend(e) {
        if (this.down) {
            this.handleClicks(e, e.changedTouches[0].screenX, e.changedTouches[0].screenY);
        }
    }

    handleClicks(e, x, y) {
        if (this.options.multiClicked) {
            this.restartMultiClicked(x, y)
            this.multiClickedTimeout = setTimeout(() => this.multiClickedTimeoutHandler(e), this.options.interval);
            // console.log(this.multiClickedCount, this.multiClickedScreenX, this.multiClickedScreenY);
        } else {
            this.resetMultiClicked();
            this.callback({ event: e, type: 'clicked' });
        }
        this.cancelLongClicked();
    }

    longClicked(e) {
        this.longClikedTimeout = null;
        this.down = false;
        this.callback({ event: e, type: 'long-clicked' });
    }

    multiClickedTimeoutHandler(e) {
        this.resetMultiClicked();
        this.callback({ event: e, type: 'clicked' });
    }

    mousedown(e) {
        if (this.down === true) {
            this.cancel();
        } else {
            this.handleDown(e, e.screenX, e.screenY);
        }
    }

    mousemove(e) {
        if (this.down) {
            const x = e.screenX;
            const y = e.screenY;
            if (this.pastThreshhold(x, y)) {
                this.cancel();
            }
        }
    }

    mouseup(e) {
        if (this.down) {
            this.handleClicks(e, e.screenX, e.screenY);
        }
    }
    pastThreshhold(x, y) {
        return Math.abs(this.multiClickedScreenX - x) > this.options.thresshold || Math.abs(this.multiClickedScreenY - y) > this.options.thresshold
    }
    resetMultiClicked() {
        this.multiClickedScreenX = -1 * this.options.thresshold;
        this.multiClickedScreenY = -1 * this.options.thresshold;
        this.multiClickedCount = 0;
        this.clearMultiClickedTimeout();
    }
    restartMultiClicked(x, y) {
        this.resetMultiClicked();
        this.multiClickedScreenX = x;
        this.multiClickedScreenY = y;
    }
    clearMultiClickedTimeout() {
        if (this.multiClickedTimeout) {
            clearTimeout(this.multiClickedTimeout);
            this.multiClickedTimeout = null;
        }
    }
}

export { touchAndClick, ClickedEvents };
