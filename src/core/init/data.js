import {
    observe,
} from '../observer/index';
import {
    isPlainObject,
} from '../../utils/object';
import {
    isReserved,
} from '../../utils/string';

export default function initData(me) {
    let data = me.$options.data;
    data = me.$data = typeof data === 'function' ? data.call(me) : data || {};

    if (!isPlainObject(data)) {
        data = {};
        console.log(`options data should return an object.`);
    }

    const keys = Object.keys(data);

    for (let i = 0; i < keys.length; i++) {
        if (!isReserved()) me.proxy(`$data`, keys[i]);
    }

    observe(data);
}
