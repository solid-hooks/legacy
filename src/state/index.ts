import { trackStore } from '@solid-primitives/deep'
import { pathGet, pathSet } from 'object-standard-path'
import type { Path } from 'object-standard-path'
import { batch, createContext, createEffect, on, onCleanup, onMount, useContext } from 'solid-js'
import type { Store } from 'solid-js/store'
import { createStore, produce, reconcile, unwrap } from 'solid-js/store'
import type { ActionObject, StateObject, StateSetup, StoreObject, SubscribeCallback } from './types'
import { deepClone } from './utils'

/**
 * initialize global state
 * @param name state name
 * @param setup state setup object
*/
export function $state<
  Name extends string,
  State extends object = Record<string, any>,
  Action extends ActionObject = {},
  Paths extends Path<State>[] = [],
>(
  name: Name,
  setup: StateSetup<State, Action, Paths>,
): () => StateObject<State, Action> {
  const { $init, $action, $persist } = setup
  const initalState = typeof $init === 'function' ? $init() : $init
  const [store, setStore] = createStore<State>(deepClone(initalState), { name: `$state_${name}` })
  const callbackList = new Set<SubscribeCallback<State>>()
  const effectList = new Set<(state: State) => void>()

  effectList.add(state => callbackList.size && batch(() => callbackList.forEach(cb => cb(state))))

  const utilFn = {
    $patch: (state: Partial<State> | ((oldState: State) => void)) => {
      setStore(
        typeof state === 'function'
          ? produce(state)
          : reconcile(
            Object.assign({}, unwrap(store), state),
            { key: name, merge: true },
          ),
      )
    },
    $reset: () => setStore(
      reconcile(initalState, { key: name, merge: true }),
    ),
    $subscribe: (callback: (state: State) => void) => {
      callbackList.add(callback)
      return () => callbackList.delete(callback)
    },
  }

  createEffect(on(
    $trackStore(store),
    (state: State) => effectList.forEach(cb => cb(state)),
    { defer: true },
  ))

  const initState = () => {
    if ($persist && $persist.enable) {
      const {
        debug = false,
        key = name,
        serializer: { serialize, deserialize } = { serialize: JSON.stringify, deserialize: JSON.parse },
        storage = localStorage,
        paths,
      } = $persist

      let obj = {} as any
      function persistItems(state: State, isInital = false) {
        if (!paths || paths.length === 0) {
          const serializedState = serialize(state)
          debug && console.log(`[$state - ${key}]: update to ${serializedState}`)
          storage.setItem(key, serializedState)
          return
        }
        let isSame = true
        for (const path of paths) {
          const oldValue = pathGet(obj, path)
          const newValue = pathGet(state, path)
          if (oldValue !== newValue) {
            isSame = false
          }
          pathSet(obj, path as any, newValue)
        }
        if (isSame && !isInital) {
          return
        }
        const serializedObject = serialize(obj)
        debug && console.log(`[$state - ${key}]: update to ${serializedObject}`)
        storage.setItem(key, serializedObject)
      }
      onMount(() => {
        const stored = storage.getItem(key)
        try {
          if (stored) {
            utilFn.$patch(deserialize(stored))
            debug && console.log(`[$state - ${key}]: read from persisted, value: ${stored}`)
          } else {
            persistItems(unwrap(store), true)
            debug && console.log(`[$state - ${key}]: no persisted data, initialize`)
          }
        } catch (e) {
          debug && console.error(`[$state - ${key}]: ${e}`)
        }
      })
      effectList.add(state => persistItems(state))
    }
    onCleanup(() => {
      callbackList.clear()
      effectList.clear()
    })
    return Object.assign(
      () => store,
      utilFn,
      $action?.(store, setStore, utilFn),
    )
  }

  const ctx = createContext(initState())
  return () => useContext(ctx)
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