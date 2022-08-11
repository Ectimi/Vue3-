import { isObject } from '@vue/shared';
import { ReactiveEffect } from './effect';
import { isReactive } from './reactive';

function traversal(value: Object, set = new Set()) {
    //不是对象就不递归了
    if(!isObject(value)) return value;

    let key:any;
    for(key in value){
        // traversal(value[key])
    }
}

/**
 *
 * @param source 用户传入的对象
 * @param cb 回调函数
 */
export function watch(source: unknown, cb: Function) {
  let getter: Function = () => {};

  if (isReactive(source)) {
    //对用户传入的数据进行递归循环，只要循环就会访问对象上的每一个属性，访问属性的时候会收集effect
    getter = () => traversal(source as ProxyConstructor);
  }
  let oldValue: any;
  const job = () => {
    const newValue = effect.run();
    cb(newValue, oldValue);
    oldValue = newValue;
  };
  const effect = new ReactiveEffect(getter, job); //监控自己构造的函数，变化后重新执行job
  oldValue = effect.run();
}
