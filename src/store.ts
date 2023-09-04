import type { ContextProvider, ContextProviderProps } from '@solid-primitives/context'
import { createContextProvider } from '@solid-primitives/context'
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
  return Object.assign(
    () => store,
    { $set: setStore },
  )
}

/**
 * type for {@link $ctx}
 */
export type ContextObject<T extends object> = {
  (): StoreObject<T> | undefined
  $Provider: ContextProvider<ContextProviderProps>
}

/**
 * object wrapper for {@link createContextProvider} with {@link StoreObject}
 * @param initialValue initial value
 * @param name store name
 * @example
 * ```tsx
 * const useCtx = $ctx({ id: 1 })
 *
 * function X() {
 *   const state = useCtx()!
 *   return <div>X: {state().id}</div>
 * }
 * function Y() {
 *   const state = useCtx()!
 *   return <button onClick={() => state.$set('id', i => i + 1)}>+</button>
 * }
 * export default function ShowContext() {
 *   console.log(useCtx()) // undefined
 *   return (
 *     <useCtx.$Provider>
 *       <X />
 *       <Y />
 *     </useCtx.$Provider>
 *   )
 * }
 * ```
 */
export function $ctx<T extends object>(
  initialValue: T,
  name?: string,
): ContextObject<T> {
  const [provider, useCtx] = createContextProvider(
    () => $store<T>(initialValue, name),
  )
  return Object.assign(
    () => useCtx(),
    {
      $Provider: provider,
    },
  )
}
/**
 * accessor wrapper for {@link trackStore}
 * @param store tracked store
 */

export function $trackStore<T extends object>(store: Store<T> | StoreObject<T>) {
  return () => trackStore(typeof store === 'function' ? store() : store)
}
