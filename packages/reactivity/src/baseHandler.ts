import { isObject } from '@vue/shared';
import { reactive } from './reactive';
import { track, trigger } from './effect';

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
}

export const mutableHandlers: ProxyHandler<any> = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) return true;
    track(target, key as string);
    let res = Reflect.get(target, key, receiver);
    if(isObject(res)){
      return reactive(res); //深度代理实现
    }
    return res;
  },
  set(target, key, value, receiver) {
    let oldValue = target[key];
    let result = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      //值变化了才更新
      trigger(target, key as string, value, oldValue);
    }

    return result;
  },
};
