type TDep = Set<ReactiveEffect> | undefined;
type TDepsMap = Map<string, TDep>;
type TRunner = { (): void; effect: ReactiveEffect };
type TEffectOptions = {
  scheduler: Function;
};

export let activeEffect: null | ReactiveEffect = null;

function cleanupEffect(effect: ReactiveEffect) {
  const { deps } = effect;
  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effect); //解除effect，重新收集依赖
  }
  effect.deps.length = 0;
}

export class ReactiveEffect {
  public deps: Set<ReactiveEffect>[] = [];
  public parent: null | ReactiveEffect = null;
  public active = true; //这个effect默认是激活状态

  //用户传递的参数也会在this上，this.fn = fn
  constructor(
    public fn: Function,
    public scheduler: TEffectOptions['scheduler']
  ) {}

  run() {
    //如果是非激活状态，只需要执行函数，不需要进行依赖收集
    if (!this.active) {
      return this.fn();
    }
    //这里就需要收集依赖了，核心是将当前的 effect 和稍后渲染的属性关联在一起
    try {
      this.parent = activeEffect;
      activeEffect = this;
      cleanupEffect(this);
      return this.fn();
    } finally {
      activeEffect = this.parent;
    }
  }

  stop() {
    if (this.active) {
      this.active = false;
      cleanupEffect(this); //停止effect收集
    }
  }
}

const targetMap = new WeakMap();

export function effect(fn: Function, options: TEffectOptions) {
  //这里 fn 可以根据状态变化，重新执行，effect可以嵌套着写

  const _effect = new ReactiveEffect(fn, options.scheduler); //创建响应式 effect
  _effect.run(); //默认先执行一次

  const runner: TRunner = _effect.run.bind(_effect) as TRunner;
  runner.effect = _effect;

  return runner;
}

/**
 *  @description 收集依赖,一个effect对应多个属性，一个属性对应多个effect
 * 思路：
 * 使用 WeakMap 收集依赖，创建以下格式的 WeakMap
 * 对象 某个属性 =》 多个effect
 * WeakMap = {对象:Map{name:Set}}
 * {对象：{name:[]}}
 */
export function track(target: Object, key: string) {
  if (!activeEffect) return;
  let depsMap: TDepsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep: TDep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  let shouldTrack = !dep.has(activeEffect);
  if (shouldTrack) {
    dep.add(activeEffect);
    //让effect记录信对应的dep，清理的时候会用到
    activeEffect.deps.push(dep);
  }
}

export function trigger(
  target: Object,
  key: string,
  value: any,
  oldValue: any
) {
  const depsMap: TDepsMap = targetMap.get(target);
  if (!depsMap) return; //触发的值不在模板中使用，什么都不用干
  let effects = depsMap.get(key);
  if (effects) {
    effects = new Set(effects);
    effects.forEach((effect) => {
      //如果在effect里进行set操作，会出现在执行effect的时候，又要执行自己，造成无限调用，所以需要屏蔽掉
      if (effect !== activeEffect) {
        //如果用户传入了调试函数，则使用用户的，否则默认刷新视图
        if (effect.scheduler) {
          effect.scheduler(); 
        } else {
          effect.run();
        }
      }
    });
  }
}
