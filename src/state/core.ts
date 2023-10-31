import { type Path, pathGet, pathSet } from 'object-standard-path'
import type { FlowProps, Owner } from 'solid-js'
import {
  DEV,
  batch,
  createComponent,
  createContext,
  createRoot,
  getOwner,
  runWithOwner,
  useContext,
} from 'solid-js'
import { reconcile, unwrap } from 'solid-js/store'
import { klona as deepClone } from 'klona'
import type { StoreObject } from '../store'
import { $patchStore, $store } from '../store'
import { $watch } from '../watch'
import { usePersist } from '../hooks'
import type {
  ActionObject,
  GetterObject,
  StateFunction,
  StateObject,
  StateReturn,
  StateSetup,
  StateUtils,
} from './types'
import { createActions, createGetters, getLogger } from './utils'

type GlobalStateContext = {
  owner: Owner | null
  map: Map<string, any>
}

const $STATE_CTX = createContext<GlobalStateContext>({ owner: null, map: new Map() })
/**
 * initialize global state with setup object
 * @param name state name
 * @param setup state setup object
 * @param _log whether to enable log when dev, default is `false`
 * @see https://github.com/subframe7536/solid-dollar#state
 */
export function $state<
  State extends object = Record<string, any>,
  Getter extends GetterObject = {},
  Action extends ActionObject = {},
  Paths extends Path<State>[] = [],
>(
  name: string,
  setup: StateSetup<State, Getter, Action, Paths>,
  _log?: boolean,
): StateReturn<StateObject<State, Getter, Action>>
/**
 * initialize global state with function
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
): StateReturn<State>
export function $state<
  State extends object = Record<string, any>,
  Getter extends GetterObject = {},
  Action extends GetterObject = {},
  Paths extends Path<State>[] = [],
>(
  name: string,
  setup: StateSetup<State, Getter, Action, Paths> | StateFunction<State>,
  _log?: boolean,
): StateReturn<State | StateObject<State, Getter, Action>> {
  const stateName = `$state-${name}`
  let build = typeof setup === 'function' ? setup : setupObject(setup)

  return () => {
    const ctx = useContext($STATE_CTX)
    const _map = ctx.map
    if (_map.has(name)) {
      return _map.get(name)
    }
    function attach(result: State | StateObject<State, Getter, Action>) {
      _map.set(name, result)
      // @ts-expect-error for GC
      build = null
      return result
    }
    return ctx.owner
      ? runWithOwner(ctx.owner, () => attach(build(stateName, getLogger(_log, stateName))))
      : attach(createRoot(() => build(stateName, getLogger(_log, stateName))))
  }
}
/**
 * initialize global state with setup object without context
 * @param name state name
 * @param setup state setup object
 * @param _log whether to enable log when dev, default is `false`
 * @see https://github.com/subframe7536/solid-dollar#state
 */
export function defineState<
  State extends object = Record<string, any>,
  Getter extends GetterObject = {},
  Action extends ActionObject = {},
  Paths extends Path<State>[] = [],
>(
  name: string,
  setup: StateSetup<State, Getter, Action, Paths>,
  _log?: boolean,
): StateReturn<StateObject<State, Getter, Action>>
/**
 * initialize global state with function without context
 * @param name state name
 * @param setup state setup function
 * @param _log whether to enable log when dev, default is `false`
 */
export function defineState<
  State extends object = Record<string, any>,
>(
  name: string,
  setup: StateFunction<State>,
  _log?: boolean,
): StateReturn<State>
export function defineState<
  State extends object = Record<string, any>,
  Getter extends GetterObject = {},
  Action extends GetterObject = {},
  Paths extends Path<State>[] = [],
>(
  name: string,
  setup: StateSetup<State, Getter, Action, Paths> | StateFunction<State>,
  _log?: boolean,
): StateReturn<State | StateObject<State, Getter, Action>> {
  const stateName = `$state-${name}`
  const result = (typeof setup === 'function' ? setup : setupObject(setup))(
    stateName,
    getLogger(_log, stateName),
  )
  return () => result as any
}

/**
 * global state provider
 */
export function GlobalStateProvider(props: FlowProps) {
  const _owner = getOwner()
  if (DEV && !_owner) {
    throw new Error('<StateProvider /> must be set inside component')
  }
  return createComponent($STATE_CTX.Provider, {
    value: {
      owner: _owner!,
      map: new Map(),
    },
    get children() {
      return props.children
    },
  })
}
function setupObject<
  State extends object = Record<string, any>,
  Getter extends GetterObject = {},
  Action extends GetterObject = {},
  Paths extends Path<State>[] = [],
>(
  setup: StateSetup<State, Getter, Action, Paths>,
): StateFunction<StateObject<State, Getter, Action>> {
  const { init, getters, actions, persist } = setup
  const {
    serializer = {
      write: JSON.stringify,
      read: JSON.parse,
    },
    storage = localStorage,
    paths,
    listenEvent = true,
  } = persist || {}

  return (stateName, log) => {
    const key = persist?.key || stateName
    const initialState = typeof init === 'function' ? init() : init
    const isArray = Array.isArray(initialState)
    let _store = $store(
      isArray ? initialState : deepClone(initialState),
      { name: stateName },
    ) as StoreObject<State>

    const utilFn: StateUtils<State> = {
      $patch: state => $patchStore(_store, state),
      $reset: () => {
        if (isArray) {
          DEV && log('can not reset')
          return
        }
        _store.$set(reconcile(initialState, { merge: true }))
      },
      $subscribe: (deps, callback, options) => $watch(
        () => deps(_store()),
        (value, oldValue, times) => batch(() => callback(value, oldValue, times)),
        options,
      ),
    }
    DEV && log('initial state:', unwrap(_store()))

    if (persist?.enable) {
      let isInitalize = true
      _store = usePersist(key, _store, {
        listenEvent,
        serializer,
        storage,
        writeData(storage, key, state, writeFn) {
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
          if (isInitalize || old !== serializedState) {
            storage.setItem(key, serializedState)
            DEV && log('persist state:', serializedState)
            isInitalize && (isInitalize = false)
          }
        },
      })
    }

    return Object.assign(
      () => _store(),
      utilFn,
      createGetters(getters, _store, stateName),
      createActions(actions?.(_store, utilFn)),
      { $id: stateName },
    )
  }
}
