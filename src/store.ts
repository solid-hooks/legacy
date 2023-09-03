import { trackStore } from '@solid-primitives/deep'
import type { SetStoreFunction, Store } from 'solid-js/store'
import { createStore } from 'solid-js/store'

/**
 * type of `$store()`
 */
export type StoreObject<T extends object> = {
  (): Store<T>
  readonly $set: SetStoreFunction<T>
}

/**
 * object wrapper for `createStore`
 * @param initialValue initial value
 */

export function $store<T extends object>(initialValue: T, name?: string): StoreObject<T> {
  const [store, setStore] = createStore<T>(initialValue, { name })
  return Object.assign(
    () => store,
    { $set: setStore },
  )
}
/**
 * accessor wrapper for `trackStore`
 * @param store tracked store
 */

export function $trackStore<T extends object>(store: Store<T> | StoreObject<T>) {
  return () => trackStore(typeof store === 'function' ? store() : store)
}
