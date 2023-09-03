import { type Path, pathGet, pathSet } from 'object-standard-path'
import { DEV, batch, createComputed, createContext, createEffect, on, onCleanup, onMount, useContext } from 'solid-js'
import { createStore, produce, reconcile, unwrap } from 'solid-js/store'
import { $trackStore } from '../store'
import type { ActionObject, StateObject, StateSetup, SubscribeCallback } from './types'
import { deepClone } from './utils'

/**
 * initialize global state
 * @param name state name
 * @param setup state setup object
 * @param _log whether to enable log when dev, default is `false`
*/
export function $state<
  State extends object = Record<string, any>,
  Action extends ActionObject = {},
  Paths extends Path<State>[] = [],
>(
  name: string,
  setup: StateSetup<State, Action, Paths>,
  _log?: boolean,
): () => StateObject<State, Action> {
  const { $init, $action, $persist } = setup
  const {
    key = name,
    serializer: { write: writeFn, read: readFn } = { write: JSON.stringify, read: JSON.parse },
    storage = localStorage,
    paths,
  } = $persist || {}

  const initialState = typeof $init === 'function' ? $init() : $init
  const stateName = `$state::${name}`
  const [store, setStore] = Array.isArray(initialState)
    ? initialState
    // eslint-disable-next-line solid/reactivity
    : createStore<State>(deepClone(initialState), { name: stateName })

  const callbackList = new Set<SubscribeCallback<State>>()
  const effectList = new Set<(state: State) => void>()
  const log = (...args: any[]) => DEV && _log && console.log(`[${stateName}]`, ...args)

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
      log('persist state:', serializedState)
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
      if (Array.isArray(initialState)) {
        log('Fail to reset: type of initial value is Store')
        return
      }
      setStore(
        reconcile(initialState, { key: name, merge: true }),
      )
      if (resetPersist && $persist && $persist.enable) {
        storage.removeItem(key)
        persistItems(initialState, true)
      }
    },
    $subscribe: (callback: (state: State) => void) => {
      callbackList.add(callback)
      return () => callbackList.delete(callback)
    },
  }

  const init = () => {
    log('initial state:', unwrap(store))
    createEffect(on(
      $trackStore(store),
      state => callbackList.size && batch(() => callbackList.forEach(cb => cb(state))),
    ))
    if ($persist && $persist.enable) {
      onMount(() => {
        const stored = storage.getItem(key)
        if (stored) {
          log('load from storage:', stored)
          utilFn.$patch(readFn(stored))
        } else {
          log('no previous store, persist')
          persistItems(unwrap(store), true)
        }
      })
      createComputed(on(
        $trackStore(store),
        (state: State) => persistItems(state),
        { defer: true },
      ))
    }
    onCleanup(() => {
      log('cleanup')
      callbackList.clear()
      effectList.clear()
    })
    return Object.assign(
      () => store,
      utilFn,
      $action?.(store, setStore, utilFn),
    )
  }

  const ctx = createContext(init())
  return () => useContext(ctx)
}
