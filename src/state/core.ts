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
import { $patchStore, $store, $trackStore } from '../store'
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
import { createActions, createGetters } from './utils'

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
  const log = (...args: any[]) => DEV && _log && console.log(`[${stateName}]`, ...args)
  let build = typeof setup === 'function' ? setup : setupObject(setup)

  return () => {
    const ctx = useContext($STATE_CTX)
    const _map = ctx.map
    if (_map.has(name)) {
      return _map.get(name)
    }
    function attach(result: State | StateObject<State, Getter, Action>, msg: string) {
      _map.set(name, result)
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
    let _store = $store(
      Array.isArray(initialState) ? initialState : deepClone(initialState),
      { name: stateName },
    ) as StoreObject<State>

    let dep: () => State
    const getDeps = () => {
      !dep && (dep = $trackStore(_store()))
      return dep
    }
    const utilFn: StateUtils<State> = {
      $patch: state => $patchStore(_store, state),
      $reset: () => {
        if (Array.isArray(initialState)) {
          DEV && log('can not reset')
          return
        }
        _store.$set(reconcile(initialState, { merge: true }))
      },
      $subscribe: (...args: any[]) => $watch(
        ...typeof args[1] === 'function'
          ? [
              () => args[0](_store()),
              (state: any, oldState: any) => batch(() => args[1](unwrap(state), unwrap(oldState))),
              args[2],
            ] as const
          : [
              getDeps(),
              (state: any) => batch(() => args[0](unwrap(state))),
              args[1],
            ] as const,
      ),
    }
    log('initial state:', unwrap(_store()))

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
            log('persist state:', serializedState)
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
