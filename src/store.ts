import { trackStore } from '@solid-primitives/deep'
import type { SetStoreFunction, Store } from 'solid-js/store'
import { createStore } from 'solid-js/store'

/**
 * type of {@link $store}
 */
export type StoreObject<T extends object> = {
  (): Store<T>
  readonly $: SetStoreFunction<T>
}

/**
 * object wrapper for {@link createStore}
 * @param data initial value
 * @param name store name
 */
export function $store<T extends object>(
  data: T,
  name?: string,
): StoreObject<T>
/**
 * object wrapper for {@link createStore}
 * @param data exist store
 */
export function $store<T extends object>(
  data: [Store<T>, SetStoreFunction<T>],
): StoreObject<T>
export function $store<T extends object>(
  data: any,
  name?: string,
): StoreObject<T> {
  // eslint-disable-next-line solid/reactivity
  const [store, setStore] = Array.isArray(data) ? data : createStore<T>(data, { name })
  const result = () => store
  result.$ = setStore
  return result
}

/**
 * accessor wrapper for {@link trackStore}
 * @param store tracked store
 */
export function $trackStore<T extends object>(store: Store<T> | StoreObject<T>) {
  return () => trackStore(typeof store === 'function' ? store() : store)
}
