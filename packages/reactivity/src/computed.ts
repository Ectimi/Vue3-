import { isFunction } from '@vue/shared';
import { ReactiveEffect } from './effect';

type IGetterOrOptions =
  | Function
  | {
      get: Function;
      set: Function;
    };

class ComputedRefImpl {
  public effect: ReactiveEffect;
  constructor(public getter: Function, public setter: Function) {
    //将用户的getter放到effect中，effect会收集getter的依赖，
    this.effect = new ReactiveEffect(getter, () => {
      //稍后依赖变化后，会执行此高度函数
    });
  }
}

export const computed = (getterOrOptions: IGetterOrOptions) => {
  let getter: Function;
  let setter: Function;

  if (typeof getterOrOptions === 'function') {
    getter = getterOrOptions as Function;
    setter = () => {
      console.warn('no set');
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }

  return new ComputedRefImpl(getter, setter);
};
