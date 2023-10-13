import { type Path, pathGet, pathSet } from 'object-standard-path'
import type { FlowProps, Owner } from 'solid-js'
import {
  DEV,
  createComponent,
  createComputed,
  createContext,
  createMemo,
  createRoot,
  getOwner,
  on,
  runWithOwner,
  useContext,
} from 'solid-js'
import { produce, reconcile, unwrap } from 'solid-js/store'
import type { StoreObject } from '../store'
import { $store, $trackStore } from '../store'
import { $watch } from '../watch'
import type { ActionObject, GetterObject, StateFunction, StateObject, StateSetup, StateUtils } from './types'
import { createActions, deepClone } from './utils'

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
): () => StateObject<State, Getter, Action>
/**
 * initialize global state with functions, just like global {@link createContext}
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
  Getter extends GetterObject = {},
  Action extends GetterObject = {},
  Paths extends Path<State>[] = [],
>(
  name: string,
  setup: StateSetup<State, Getter, Action, Paths> | StateFunction<State>,
  _log?: boolean,
): () => State | StateObject<State, Getter, Action> {
  const stateName = `$state-${name}`
  const log = (...args: any[]) => DEV && _log && console.log(`[${stateName}]`, ...args)
  let build = typeof setup === 'function' ? setup : setupObject(setup)

  return () => {
    const ctx = useContext($STATE_CTX)
    const _m = ctx.map
    if (_m.has(name)) {
      return _m.get(name)
    }
    function attach(result: State | StateObject<State, Getter, Action>, msg: string) {
      _m.set(name, result)
      log(msg)
      // @ts-expect-error for GC
      build = null
      return result
    }
    return ctx.owner
      ? runWithOwner(ctx.owner, () => attach(
        build(stateName, log),
        DEV ? 'mount to <StateProvider />' : '',
      ))
      : attach(
        createRoot(() => build(stateName, log)),
        DEV ? '<StateProvider /> is not set, fallback to use createRoot' : '',
      )
  }
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
  const { $init, $getters, $actions, $persist } = setup
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
    const _store = $store(
      Array.isArray(initialState) ? initialState : deepClone(initialState),
      { name: stateName },
    ) as StoreObject<State>

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
    let dep: () => State
    const getDeps = () => {
      !dep && (dep = $trackStore(_store()))
      return dep
    }
    const utilFn: StateUtils<State> = {
      $patch: state => _store.$(
        typeof state === 'function'
          ? produce(state)
          : reconcile(
            Object.assign({}, unwrap(_store()), state),
            { key: stateName, merge: true },
          ),
      ),
      $reset: () => {
        if (Array.isArray(initialState)) {
          DEV && log('cannot reset, type of initial value is Store')
          return
        }
        _store.$(
          reconcile(initialState, { key: stateName, merge: true }),
        )
      },
      $subscribe: (cb, { path, ...options } = {}) => $watch(
        path ? () => pathGet(_store(), path) : getDeps() as any,
        s => cb(unwrap(s) as any),
        options,
      ),
    }
    log('initial state:', unwrap(_store()))

    if ($persist && $persist.enable) {
      const stored = storage.getItem(key)
      if (stored) {
        log('load from storage:', stored)
        utilFn.$patch(readFn(stored))
      } else {
        log('no previous store, persist')
        persistItems(unwrap(_store()), true)
      }
      createComputed(on(
        getDeps(),
        state => persistItems(unwrap(state)),
        { defer: true },
      ))
    }

    const getters = {} as Readonly<Getter>
    for (const [key, getter] of Object.entries($getters?.(_store()) || {})) {
      // @ts-expect-error assign
      getters[key] = getter.length === 0
        ? createMemo(getter, undefined, { name: `${stateName}-${getter.name}` })
        : getter
    }

    return Object.assign(
      () => _store(),
      utilFn,
      getters,
      { $: createActions($actions?.(_store, utilFn)) },
    )
  }
}
