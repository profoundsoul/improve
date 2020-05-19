import SessionStorage from 'sessionstorage';
import StoreJS from 'storejs';
import {VCONSOLE_DEBUG_SWITCH_KEY} from './constant'

let _ = {
    getDebugSwitchValue() {
        // 优先取值localstorage,其次取值sessionStorage
        return _._getDebugByLocalStorage() || _._getDebugBySessionStorage();
    },
    _getDebugBySessionStorage() {
        return !!SessionStorage.getItem(VCONSOLE_DEBUG_SWITCH_KEY) ? true : false;
    },
    _getDebugByLocalStorage() {
        let debug = StoreJS.get(VCONSOLE_DEBUG_SWITCH_KEY);
        if (debug) {
            let now = +Date.now();
            if (now > debug.time) {
                // 删除对应的KEY数据
                StoreJS.remove(VCONSOLE_DEBUG_SWITCH_KEY);
                return false;
            }
            return true;
        }
        return false;
    },
    setDebugSwitchValue(debugValidTime=100, isLongValid = false) {
        if (isLongValid) {
            // 长效机制保存到LocalStorage
            StoreJS.set(VCONSOLE_DEBUG_SWITCH_KEY, {
                time: (+new Date() + debugValidTime)
            }, true)
        } else {
            // 会话机制保存到SessionStorage
            if (!_._getDebugBySessionStorage()) {
                SessionStorage.setItem(VCONSOLE_DEBUG_SWITCH_KEY, 1);
            }
        }
    }
}

export default _;