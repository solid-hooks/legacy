import { trackStore } from '@solid-primitives/deep'
import type { SetStoreFunction, Store } from 'solid-js/store'
import { createStore } from 'solid-js/store'

/**
 * type of {@link $store}
 */
export type StoreObject<T extends object> = {
  (): Store<T>
  readonly $set: SetStoreFunction<T>
}

/**
 * object wrapper for {@link createStore}
 * @param initialValue initial value
 * @param name store name
 */
export function $store<T extends object>(
  initialValue: T,
  name?: string,
): StoreObject<T> {
  const [store, setStore] = createStore<T>(initialValue, { name })
  const result = () => store
  result.$set = setStore
  return result
}

/**
 * accessor wrapper for {@link trackStore}
 * @param store tracked store
 */
export function $trackStore<T extends object>(store: Store<T> | StoreObject<T>) {
  return () => trackStore(typeof store === 'function' ? store() : store)
}
