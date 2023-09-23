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
import type { GetterOrActionObject, StateFunction, StateObject, StateSetup, StateUtils } from './types'
import { createActions, deepClone } from './utils'

const GLOBAL_$STATE = createContext<{
  owner: Owner | null
  map: Map<string, any>
}>({
  owner: null,
  map: new Map(),
})
/**
 * initialize global state with setup object
 * @param name state name
 * @param setup state setup object
 * @param _log whether to enable log when dev, default is `false`
 * @example
 * ```tsx
 * const useTestState = $state('test', {
 *   $init: { value: 1 },
 *   $getter: state => ({
 *     // without param, will auto wrapped with `createMemo`
 *     doubleValue() {
 *       return state.value * 2
 *     },
 *   }),
 *   $action: stateObj => ({
 *     double(num: number) {
 *       stateObj.$('value', value => value * 2 * number)
 *     },
 *     plus(num: number) {
 *       stateObj.$('value', value => value + num)
 *     },
 *   }),
 *   $persist: {
 *     enable: true,
 *     storage: localStorage,
 *     path: ['test'] // type safe, support array
 *   },
 * }, true) // set true to enable DEV log
 *
 * // usage
 * const state = useTestState()
 * render(() => (
 *   <StateProvider> // optional
 *     state: <p>{state().value}</p>
 *     getter: <p>{state.doubleValue()}</p>
 *     action: <button onClick={state.$.double}>double</button>
 *     action: <button onClick={() => state.$.plus(2)}>plus 2</button>
 *   </StateProvider>
 * ))
 *
 * // use produce()
 * state.$patch((state) => {
 *   state().test = 3
 * })
 * // use reconcile()
 * state.$patch({
 *   test: 2
 * })
 *
 * // watch
 * const { pause, resume, isWatching } = state.$subscribe(
 *   (state) => console.log(state),
 *   { defer: true },
 * )
 *
 * // reset
 * state.$reset()
 * ```
 */
export function $state<
  State extends object = Record<string, any>,
  Getter extends GetterOrActionObject = {},
  Action extends GetterOrActionObject = {},
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
  Getter extends GetterOrActionObject = {},
  Action extends GetterOrActionObject = {},
  Paths extends Path<State>[] = [],
>(
  name: string,
  setup: StateSetup<State, Getter, Action, Paths> | StateFunction<State>,
  _log?: boolean,
): () => State | StateObject<State, Getter, Action> {
  const stateName = `$state::${name}`
  const log = (...args: any[]) => DEV && _log && console.log(`[${stateName}]`, ...args)
  let build = typeof setup === 'function' ? setup : setupObject(setup)

  return () => {
    const ctx = useContext(GLOBAL_$STATE)
    const _m = ctx.map
    if (_m.has(name)) {
      return _m.get(name)
    }
    function mount(result: State | StateObject<State, Getter, Action>, msg: string) {
      _m.set(name, result)
      log(msg)
      // @ts-expect-error for GC
      build = null
      return result
    }
    return !ctx.owner
      ? mount(
        createRoot(() => build(stateName, log)),
        DEV ? '<StateProvider /> is not set, fallback to use createRoot' : '',
      )
      : runWithOwner(ctx.owner, () => mount(
        build(stateName, log),
        DEV ? 'mount to <StateProvider />' : '',
      ))
  }
}

export function StateProvider(props: FlowProps) {
  const _owner = getOwner()
  if (DEV && !_owner) {
    throw new Error('<StateProvider /> must called inside component')
  }
  return createComponent(GLOBAL_$STATE.Provider, {
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
  Getter extends GetterOrActionObject = {},
  Action extends GetterOrActionObject = {},
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
      stateName,
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
    const utilFn: StateUtils<State> = {
      $patch: (state) => {
        _store.$(
          typeof state === 'function'
            ? produce(state)
            : reconcile(
              Object.assign({}, unwrap(_store()), state),
              { key: stateName, merge: true },
            ),
        )
      },
      $reset: (resetPersist) => {
        if (Array.isArray(initialState)) {
          log('cannot reset, type of initial value is Store')
          return
        }
        _store.$(
          reconcile(initialState, { key: stateName, merge: true }),
        )
        if (resetPersist && $persist && $persist.enable) {
          storage.removeItem(key)
          persistItems(initialState, true)
        }
      },
      $subscribe: (callback, options) => $watch(
        $trackStore(_store()),
        s => callback(unwrap(s)),
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
        $trackStore(_store()),
        state => persistItems(unwrap(state)),
        { defer: true },
      ))
    }

    const result = {} as Readonly<Getter>
    for (const [key, getter] of Object.entries($getters?.(_store()) || {})) {
      // @ts-expect-error assign
      // eslint-disable-next-line solid/reactivity
      result[key] = getter.length === 0 ? createMemo(getter) : getter
    }

    return Object.assign(
      () => _store(),
      utilFn,
      result,
      {
        $: createActions($actions?.(_store, utilFn)),
      },
    )
  }
}