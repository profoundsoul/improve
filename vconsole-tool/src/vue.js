import VConsoleTool from './tool'
import {VCONSOLE_DEBUG_SWITCH_KEY} from './constant'


let VueRoutePlugin =  {
    install: function (Vue, options = {}) {
        Vue.mixin({
            data: function () {
                return {
                    [VCONSOLE_DEBUG_SWITCH_KEY]: null,
                }
            },
            beforeRouteEnter(to, from, next) {
                next(vm =>{
                    // 提前一点点挂载上去，会监听更多数据
                    let vConsole = null;
                    try{
                        vConsole =  new VConsoleTool(options);
                    }finally{
                        vm.$nextTick(() => {
                            if (!vm[VCONSOLE_DEBUG_SWITCH_KEY]) {
                                vm[VCONSOLE_DEBUG_SWITCH_KEY] = vConsole;
                            }
                        })
                    }
                });
            },
            beforeRouteLeave(to, from, next) {
                try {
                    if (this[VCONSOLE_DEBUG_SWITCH_KEY]) {
                        this[VCONSOLE_DEBUG_SWITCH_KEY].destroy();
                        this[VCONSOLE_DEBUG_SWITCH_KEY] = null;
                    }
                } catch (err) {
                    console.log('beforeRouteLeave: ', err);
                }
                finally {
                    next();
                }
            },
            destroyed() {
                try {
                    if (this[VCONSOLE_DEBUG_SWITCH_KEY]) {
                        this[VCONSOLE_DEBUG_SWITCH_KEY].destroy();
                        this[VCONSOLE_DEBUG_SWITCH_KEY] = null;
                    }
                } catch (err) {
                    console.log('destroyed: ', err);
                }
            }
        })
    }
};

let VuePagePlugin = {
    install: function (Vue, options = {}) {
        Vue.mixin({
            data: function () {
                return {
                    [VCONSOLE_DEBUG_SWITCH_KEY]: null,
                }
            },
            mounted() {
                this.$nextTick(() => {
                    if (!this[VCONSOLE_DEBUG_SWITCH_KEY]) {
                        this[VCONSOLE_DEBUG_SWITCH_KEY] = new VConsoleTool(options);
                    }
                });
            },
            destroyed() {
                try {
                    if (this[VCONSOLE_DEBUG_SWITCH_KEY]) {
                        this[VCONSOLE_DEBUG_SWITCH_KEY].destroy();
                        this[VCONSOLE_DEBUG_SWITCH_KEY] = null;
                    }
                } catch (err) {
                    console.log('destroyed: ', err);
                }
            }
        })
    }
}

export {
    VConsoleTool,
    VuePagePlugin,
    VueRoutePlugin
}