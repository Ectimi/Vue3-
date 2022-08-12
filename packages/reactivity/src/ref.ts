import { isArray, isObject } from '@vue/shared';
import { reactive } from './reactive';
import { ReactiveEffect, trackEffects, triggerEffects } from './effect';

type TObject = { [key: string | number]: any };

function toReactive(value: unknown) {
  return isObject(value) ? reactive(value) : value;
}

class RefImpl<T> {
  private _value: T;
  private __v_isRef = true;
  private dep: Set<ReactiveEffect> = new Set();

  constructor(public rawValue: T) {
    this._value = toReactive(rawValue);
  }

  get value() {
    trackEffects(this.dep);
    return this._value;
  }
  set value(newValue) {
    if (newValue !== this.rawValue) {
      this._value = toReactive(newValue);
      this.rawValue = newValue;
      triggerEffects(this.dep);
    }
  }
}

export function ref<T>(value: T) {
  return new RefImpl(value);
}

class ObjectRefImpl<T extends object, K extends keyof T> {
//   private __v_isRef = true;
  constructor(public object: T, public key: K) {}

  get value() {
    return this.object[this.key];
  }
  set value(newValue) {
    this.object[this.key] = newValue;
  }
}

export function toRef<T extends object, K extends keyof T>(object: T, key: K) {
  return new ObjectRefImpl(object, key);
}

export function toRefs(object: TObject) {
  const result: TObject = isArray(object) ? new Array(object.length) : {};

  for (let key in object) {
    result[key] = toRef(object, key);
  }

  return result;
}

export function proxyRefs<T extends object>(object: T) {
  return new Proxy(object, {
    get(target, key, recevier) {
      let r = Reflect.get(target, key, recevier);
      return r.__v_isRef ? r.value : r;
    },
    set(target, key, value, recevier) {
      let oldValue = Reflect.get(target, key);
      if (oldValue.__v_isRef) {
        oldValue.value = value;
        return true;
      } else {
        return Reflect.set(target, key, value, recevier);
      }
    },
  });
}
