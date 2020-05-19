// import SessionStorage from 'sessionstorage';
// import StoreJS from 'storejs';
import VConsole from 'vconsole'
import { touchAndClick } from './events'
import helper from './helper'

const default_options = {
    // 点击次数
    clickTimes: 10,
    // 每次点击时间间隔，单位毫秒
    interval: 200,
    // 连续点击上下左右偏移阈值，默认值10px
    thresshold: 10,
    longClicked: true,
    longClickedTime: 10 * 1000,
    debugValidTime: 1000 * 60 * 10,
    disableLogScrolling: false,
    maxLogNumber: 10000
}

class VConsoleTool {
    constructor(options = {}) {
        // 处理默认值
        options = { ...Object.assign({}, default_options, options) }

        this.options = options;
        this.clickEvent = null;

        this.vConsole = null;

        this.bind();
        this.check();
    }
    check() {
        setTimeout(() => {
            if (helper.getDebugSwitchValue() && !this.vConsole) {
                this.vConsole = new VConsole({
                    disableLogScrolling: this.options.disableLogScrolling,
                    maxLogNumber: this.options.maxLogNumber
                });
            }
        }, 0);
    }
    bind() {
        if (!this.clickEvent) {
            this.clickEvent = touchAndClick(document, e => this.handleAllClicks(e), {
                longClicked: this.options.longClicked,
                longClickedTime: this.options.longClickedTime,
                thresshold: this.options.thresshold
            })
        }
    }
    unbind() {
        if (this.clickEvent) {
            this.clickEvent.destroy();
            this.clickEvent = null;
        }
    }
    handleAllClicks(e) {
        switch (e.type) {
            case 'multi-clicked':
                console.warn(`mutil Clicked ${this.options.clickTimes} Times Trigger`);
                helper.setDebugSwitchValue(this.options.debugValidTime, true);
                this.check();
                break;
            case 'long-clicked':
                console.warn('long Clicked Success!!', e);
                helper.setDebugSwitchValue(this.options.debugValidTime);
                this.check();
                break;
            default: break;
        }
    }
    static getDebugSwitchValue() {
        return helper.getDebugSwitchValue();
    }
    static setDebugSwitchValue(debugValidTime, isLongValid) {
        helper.setDebugSwitchValue(debugValidTime, isLongValid);
    }
    destroy() {
        if (this.vConsole) {
            this.vConsole.destroy();
            this.vConsole = null;
        }
        this.unbind();
    }
}

export default VConsoleTool
