import { trackStore } from '@solid-primitives/deep'
import type { AnyFunction, DeepPartial } from '@subframe7536/type-utils'
import type { SetStoreFunction, Store } from 'solid-js/store'
import { createStore, produce, reconcile, unwrap } from 'solid-js/store'
import type { BaseOptions } from 'solid-js/types/reactive/signal'

/**
 * type of {@link $store}
 */
export type StoreObject<T extends object> = {
  (): Store<T>
  /**
   * store setter function
   */
  $set: SetStoreFunction<T>
}

/**
 * object wrapper for {@link createStore}
 * @param value initial value
 * @param options base options
 * @see https://github.com/subframe7536/solid-dollar#store
 */
export function $store<T extends object>(
  value: T,
  options?: BaseOptions,
): StoreObject<T>
/**
 * object wrapper for {@link createStore}
 * @param existStore exist store
 * @see https://github.com/subframe7536/solid-dollar#store
 */
export function $store<T extends object>(
  existStore: [Store<T>, SetStoreFunction<T>],
): StoreObject<T>
export function $store<T extends object>(
  data: any,
  options?: BaseOptions,
): StoreObject<T> {
  const [store, setStore] = Array.isArray(data)
    ? data
    : createStore<T>(data, options)
  const result = () => store
  result.$set = setStore
  return result as any
}

/**
 * accessor wrapper for {@link trackStore}
 * @param store Store or {@link StoreObject}
 */
export function $trackStore<T extends object>(store: Store<T> | StoreObject<T>) {
  return () => trackStore(typeof store === 'function' ? store() : store)
}
/**
 * patch store
 * @param store StoreObject to be patched
 * @param patcher patch data
 * @see https://github.com/subframe7536/solid-dollar#patchstore
 */
export function $patchStore<T extends object>(
  store: StoreObject<T>,
  patcher: DeepPartial<T> | ((data: T) => void),
) {
  return store.$set(
    typeof patcher === 'function'
      ? produce(patcher as AnyFunction)
      : reconcile(Object.assign(unwrap(store), patcher) as T, { merge: true }),
  )
}
