import { trackStore } from '@solid-primitives/deep'
import { pathGet, pathSet } from 'object-standard-path'
import type { Path, PathValue } from 'object-standard-path'
import type { Context } from 'solid-js'
import { batch, createContext, createEffect, createMemo, getOwner, on, onMount, runWithOwner, useContext } from 'solid-js'
import { createStore, produce, reconcile, unwrap } from 'solid-js/store'
import type { SetStoreFunction, Store } from 'solid-js/store/types/store'

export type StateReturn<State, Getter = {}, Action = {}> = Action & Getter & {
  (): State
  $patch: (state: Partial<State> | ((state: State) => void)) => void
  $reset: () => void
  $subscribe: (callback: (state: State) => void) => void
}

export type StateSetup<
  State extends object,
  Getter extends GetterReturn,
  Action extends ActionReturn,
  Paths extends Path<State>[],
> = {
  state: State | (() => State)
  getter?: GetterFunction<State, Getter>
  action?: ActionFunction<State, Action>
  persist?: PersistOption<State, Paths>
}

export type ActionFunction<State, Return> = (set: SetStoreFunction<State>) => Return
export type ActionReturn = Record<string, (...args: any[]) => void> | {}
export type GetterFunction<State, Return> = (state: Store<State>) => Return
export type GetterReturn = ActionReturn
export type GenericFunction<State, Return> = (data: Store<State> | SetStoreFunction<State>) => Return

export type PersistOption<State extends object, Paths extends Path<State>[]> = Partial<NormalizedPersistOption<State, Paths>> & {
  enable: boolean
}
export type NormalizedPersistOption<State extends object, Paths extends Path<State>[] = []> = {
  storage: StorageLike
  key: string
  serializer: Serializer<FlattenType<PartialObject<State, Paths>>>
  debug: boolean
  paths: Paths | undefined
}
type PartialObject<
  T extends object,
  K extends Path<T>[],
  V = Record<string, any>,
> = K['length'] extends 0
  ? T
  : K['length'] extends 1
    ? { [P in Extract<K[0], string>]: PathValue<T, P> }
    : K extends [infer A, ...infer B]
      ? B extends any[]
        ? V & {
          [P in Extract<A, string>]: PathValue<T, Extract<A, string>>;
        } & PartialObject<T, B, V>
        : V & { [P in Extract<A, string>]: PathValue<T, Extract<A, string>> }
      : never

type FlattenType<T> = T extends infer U ? ConvertType<{ [K in keyof U]: U[K] }> : never
type ConvertType<T> = {
  [K in keyof T as K extends `${infer A}.${string}` ? A : K]: K extends `${string}.${infer B}` ? ConvertType<{ [P in B]: T[K] }> : T[K];
}
export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>
interface Serializer<State> {
  /**
   * Serializes state into string before storing
   * @default JSON.stringify
   */
  serialize: (value: State) => string

  /**
   * Deserializes string into state before hydrating
   * @default JSON.parse
   */
  deserialize: (value: string) => State
}

export function normalizePersistOption<State extends object, Paths extends Path<State>[]>(
  name: string,
  option: PersistOption<State, Paths> | undefined,
): NormalizedPersistOption<State, Paths> | undefined {
  return (!option || !option.enable)
    ? undefined
    : {
        debug: option?.debug ?? false,
        key: option?.key ?? name,
        serializer: {
          serialize: option?.serializer?.serialize ?? JSON.stringify,
          deserialize: option?.serializer?.deserialize ?? JSON.parse,
        },
        storage: option?.storage ?? localStorage,
        paths: option.paths,
      }
}

function parseFunctions<State, Return>(functions: GetterFunction<State, Return>, store: Store<State>): Return
function parseFunctions<State, Return>(functions: ActionFunction<State, Return>, store: SetStoreFunction<State>): Return
function parseFunctions<State, Return>(functions: GenericFunction<State, Return>, store: Store<State> | SetStoreFunction<State>): Return {
  const ret = {} as Return
  const parsedFn = functions(store)
  for (const key in parsedFn) {
    // @ts-expect-error keyof
    ret[key] = (...args: any[]) => typeof store === 'function'
      // @ts-expect-error keyof
      ? batch(() => parsedFn[key](...args))
      // @ts-expect-error keyof
      : createMemo(() => parsedFn[key](...args))()
  }
  return ret
}

/**
 * Creates a deep clone of the given target object or array.
 * @param target The target object or array to clone.
 * @returns The deep clone of the target.
 */
export function deepClone<T>(target: T): T {
  const newTarget = (Array.isArray(target) ? [] : {}) as T
  for (const key in target) {
    if (typeof target[key] === 'object' && target[key]) {
      newTarget[key] = deepClone(target[key])
    } else {
      newTarget[key] = target[key]
    }
  }
  return newTarget
}

/**
 * create global state
 * @param name state name
 * @param setup state setup object
*/
export function $state<
  State extends object = Record<string, any>,
  Getter extends GetterReturn = {},
  Action extends ActionReturn = {},
  Paths extends Path<State>[] = [],
>(
  name: string,
  setup: StateSetup<State, Getter, Action, Paths>,

): () => StateReturn<State, Getter, Action> {
  const { state, action = () => ({}), getter = () => ({}), persist } = setup
  const initalState = typeof state === 'function' ? state() : state
  const [store, setStore] = createStore<State>(deepClone(initalState), { name })

  const ctxData = Object.assign(
    () => store,
    {
      ...parseFunctions(getter, store),
      ...parseFunctions(action, setStore),
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
      $subscribe: (callback: (state: State) => void) => runWithOwner(
        getOwner(),
        () => createEffect(on(
          () => trackStore(store),
          (state: State) => batch(() => callback(state)),
          { defer: true },
        )),
      ),
    },
  )

  const initState = () => {
    const option = normalizePersistOption(name, persist)
    if (option) {
      const { debug, key, serializer: { deserialize, serialize }, storage, paths } = option
      function persistItems() {
        if (!paths) {
          storage.setItem(key, serialize(store as any))
          return
        }
        const obj = {}
        paths.forEach((path) => {
          pathSet(obj, path as any, pathGet(store, path))
        })
        storage.setItem(key, serialize(obj as any))
      }
      onMount(() => {
        const stored = storage.getItem(key)
        try {
          if (stored) {
            ctxData.$patch(deserialize(stored))
            debug && console.log(`[$store - ${key}]: read from persisted, value: ${stored}`)
          } else {
            persistItems()
            debug && console.log(`[$store - ${key}]: no persisted data, initialize`)
          }
        } catch (e) {
          debug && console.error(`[$store - ${key}]: ${e}`)
        }
      })
      createEffect(on(() => trackStore(store), (state: any) => {
        debug && console.log(`[$store - ${key}]: update to ${JSON.stringify(state)}`)
        persistItems()
      }, { defer: true }))
    }
    return ctxData
  }

  const ctx = createContext(initState())

  return () => useContext(ctx as unknown as Context<StateReturn<State, Getter, Action>>)
}

export type StoreObject<T extends object> = {
  (): Store<T>
  readonly $set: SetStoreFunction<T>
}

export function $store<T extends object>(initialValue?: T): StoreObject<T> {
  const [store, setStore] = createStore(initialValue)

  const ret = () => store
  ret.$set = setStore

  return ret as any
}