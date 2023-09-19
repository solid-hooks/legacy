import { type Path, pathGet, pathSet } from 'object-standard-path'
import { DEV, createComputed, createRoot, on } from 'solid-js'
import { createStore, produce, reconcile, unwrap } from 'solid-js/store'
import { $trackStore } from '../store'
import { $watch } from '../watch'
import type { ActionObject, StateFunction, StateObject, StateSetup, StateUtils } from './types'
import { deepClone } from './utils'

/**
 * {@link $state} global map
 */
export const $GLOBALSTATE$ = new Map<string, any>()

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
): () => StateObject<State, Action>
/**
 * initialize global state
 * @param name state name
 * @param setup state setup function
 * @param _log whether to enable log when dev, default is `false`
*/
export function $state<
  State extends object = Record<string, any>,
>(
  name: string,
  setup: StateFunction<State>,
  _log?: boolean,
): () => State
export function $state<
  State extends object = Record<string, any>,
  Action extends ActionObject = {},
  Paths extends Path<State>[] = [],
>(
  name: string,
  setup: StateSetup<State, Action, Paths> | StateFunction<State>,
  _log?: boolean,
): () => State | StateObject<State, Action> {
  const stateName = `$state::${name}`
  const log = (...args: any[]) => DEV && _log && console.log(`[${stateName}]`, ...args)
  const build = typeof setup === 'function' ? setup : setupObject(setup)

  $GLOBALSTATE$.set(name, createRoot(() => build(stateName, log)))
  return () => $GLOBALSTATE$.get(name)
}

function setupObject<
  State extends object = Record<string, any>,
  Action extends ActionObject = {},
  Paths extends Path<State>[] = [],
>(
  setup: StateSetup<State, Action, Paths>,
): StateFunction<StateObject<State, Action>> {
  const { $init, $action, $persist } = setup
  const {
    serializer: {
      write: writeFn,
      read: readFn,
    } = {
      write: JSON.stringify,
      read: JSON.parse,
    },
    storage = localStorage,
    paths,
  } = $persist || {}

  return (stateName, log) => {
    const key = $persist?.key ?? stateName
    const initialState = typeof $init === 'function' ? $init() : $init
    const [store, setStore] = Array.isArray(initialState)
      ? initialState
      // eslint-disable-next-line solid/reactivity
      : createStore<State>(deepClone(initialState), { name: stateName })

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
    const utilFn: StateUtils<State> = {
      $patch: (state) => {
        setStore(
          typeof state === 'function'
            ? produce(state)
            : reconcile(
              Object.assign({}, unwrap(store), state),
              { key: stateName, merge: true },
            ),
        )
      },
      $reset: (resetPersist) => {
        if (Array.isArray(initialState)) {
          log('cannot reset, type of initial value is Store')
          return
        }
        setStore(
          reconcile(initialState, { key: stateName, merge: true }),
        )
        if (resetPersist && $persist && $persist.enable) {
          storage.removeItem(key)
          persistItems(initialState, true)
        }
      },
      $subscribe: (callback, options) => $watch(
        $trackStore(store),
        s => callback(unwrap(s)),
        options,
      ),
    }
    log('initial state:', unwrap(store))

    if ($persist && $persist.enable) {
      const stored = storage.getItem(key)
      if (stored) {
        log('load from storage:', stored)
        utilFn.$patch(readFn(stored))
      } else {
        log('no previous store, persist')
        persistItems(unwrap(store), true)
      }
      createComputed(on(
        $trackStore(store),
        (state: State) => persistItems(state),
        { defer: true },
      ))
    }
    return Object.assign(
      () => store,
      utilFn,
      $action?.(store, setStore, utilFn),
    )
  }
}