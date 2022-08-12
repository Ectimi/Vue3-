import { isFunction } from '@vue/shared';
import { ReactiveEffect, trackEffects, triggerEffects } from './effect';

type IGetterOrOptions =
  | Function
  | {
      get: Function;
      set: Function;
    };

class ComputedRefImpl {
  public effect: ReactiveEffect;
  private _dirty = true; //默认应该取值的时候进行计算
  private __v_isReadonly = true;
  private __v_isRef = true;
  private _value = null;
  private dep: Set<ReactiveEffect> = new Set();

  constructor(public getter: Function, public setter: Function) {
    //将用户的getter放到effect中，effect会收集getter的依赖，
    this.effect = new ReactiveEffect(getter, () => {
      //稍后依赖变化后，会执行此调度函数
      if (!this._dirty) {
        
        this._dirty = true;
        triggerEffects(this.dep);
      }
    });
  }

  get value() {
    trackEffects(this.dep);
    if (this._dirty) {
      this._dirty = false;
      this._value = this.effect.run();
    }
    return this._value;
  }
  set value(newValue) {
    this._value = newValue;
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
