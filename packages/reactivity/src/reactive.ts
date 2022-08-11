import { isObject } from '@vue/shared';
import { mutableHandlers, ReactiveFlags } from './baseHandler';

//保存已经代理过的对象
const reactiveMap = new WeakMap();

/**
 *  将数据转为代理对象
 *  1.实现同一个对象，代理多次，返回同一个代理
 *  2. 代理对象被再次代理，可以直接返回
 */
export function reactive(target: any) {
  if (!isObject(target)) return;

  //若target为 proxy 对象，那么执行这个就会进入到 proxy 的 get 方法，如果为 true，说明已经代理过了
  if (target[ReactiveFlags.IS_REACTIVE]) return target;

  //target已经代理过，直接返回
  if (reactiveMap.has(target)) return reactiveMap.get(target);

  const proxy = new Proxy(target, mutableHandlers);

  reactiveMap.set(target, proxy);

  return proxy;
}

export function isReactive(value: any) {
  return !!(value && value[ReactiveFlags.IS_REACTIVE]);
}
