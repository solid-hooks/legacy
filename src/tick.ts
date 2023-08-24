const resolve = Promise.resolve() as Promise<any>

/**
 * vue-like next tick, {@link https://github.com/solidjs-use/solidjs-use/blob/main/packages/solid-to-vue/src/scheduler.ts reference}
 */
export function $tick<T = void>(this: T, fn?: (this: T) => void): Promise<void> {
  return fn ? resolve.then(this ? fn.bind(this) : fn) : resolve
}
