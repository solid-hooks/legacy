import { trackStore } from '@solid-primitives/deep'
import { type Path, pathGet, pathSet } from 'object-standard-path'
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
  const {
    key = name,
    serializer: { write: writeFn, read: readFn } = { write: JSON.stringify, read: JSON.parse },
    storage = localStorage,
    paths,
  } = $persist || {}

  const initalState = typeof $init === 'function' ? $init() : $init
  const [store, setStore] = createStore<State>(deepClone(initalState), { name: `$state_${name}` })

  const callbackList = new Set<SubscribeCallback<State>>()
  const effectList = new Set<(state: State) => void>()

  effectList.add(state => callbackList.size && batch(() => callbackList.forEach(cb => cb(state))))
  const persistItems = (state: State, isInital = false) => {
    const old = storage.getItem(key)
    let serializedState: string
    if (!paths || paths.length === 0) {
      serializedState = writeFn(state)
    } else {
      const obj = {}
      for (const path of paths) {
        pathSet(obj, path as any, pathGet(state, path))
      }
      serializedState = writeFn(obj)
    }
    if (isInital || old !== serializedState) {
      storage.setItem(key, serializedState)
    }
  }
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
    $reset: (resetPersist?: boolean) => {
      setStore(
        reconcile(initalState, { key: name, merge: true }),
      )
      if (resetPersist && $persist && $persist.enable) {
        storage.removeItem(key)
        persistItems(initalState, true)
      }
    },
    $subscribe: (callback: (state: State) => void) => {
      callbackList.add(callback)
      return () => callbackList.delete(callback)
    },
  }

  const initState = () => {
    if ($persist && $persist.enable) {
      effectList.add(state => persistItems(state))
      onMount(() => {
        const stored = storage.getItem(key)
        if (stored) {
          utilFn.$patch(readFn(stored))
        } else {
          persistItems(unwrap(store), true)
        }
      })
    }
    createEffect(on(
      $trackStore(store),
      (state: State) => effectList.forEach(cb => cb(state)),
      { defer: true },
    ))
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
