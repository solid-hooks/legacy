import type { Path, PathValue } from 'object-standard-path'
import type { SetStoreFunction, Store } from 'solid-js/store'
import type { Cleanupable, WatchObject, WatchOptions } from '../watch'
import type { StoreObject } from '../store'

export type StateListener<State> = (state: State) => void

export type StateUtils<State> = {
  /**
   * update state
   * - `Partial<State>`: using `reconcile` with `merge: true`, merged with previous state
   * - `((state: State) => void)`: using `produce`
   */
  $patch: (state: Partial<State> | ((state: State) => void)) => void
  /**
   * reset state
   * @param resetPersist whether to also reset persist
   */
  $reset: (resetPersist?: boolean) => void
  /**
   * subscribe to state, return {@link WatchObject}
   */
  $subscribe: (callback: (value: State) => Cleanupable, options?: WatchOptions<State>) => WatchObject
}

/**
 * retrun type of {@link $state}
 */
export type StateObject<
  State,
  Getter = GetterOrActionObject,
  Action = GetterOrActionObject,
> = Getter & StateUtils<State> & (() => State) & {
  /**
   * action records
   */
  $: Action
}
export type InitialState<State extends object> = State | (() => State | [Store<State>, SetStoreFunction<State>])

export type StateSetup<
  State extends object,
  Getter extends GetterOrActionObject,
  Action extends GetterOrActionObject,
  Paths extends Path<State>[],
> = {
  /**
   * initial state, support object or Store (return of `createStore`)
   *
   * if is Store, maybe built-in `$patch` and `$reset`
   * will not work as expect
   */
  $init: InitialState<State>
  /**
   * functions to get state
   *
   * if the function param is none, use {@link createMemo}
   */
  $getters?: StateGetter<State, Getter>
  /**
   * functions to manage state
   */
  $actions?: StateAction<State, Action>
  /**
   * persist options for state
   */
  $persist?: PersistOption<State, Paths>
}

export type StateAction<
  State extends object,
  Return extends GetterOrActionObject,
> = (
  stateObject: StoreObject<State>,
  utils: StateUtils<State>
) => Return
export type StateGetter<
  State extends object,
  Getter extends GetterOrActionObject,
> = (state: State) => Getter
export type GetterOrActionObject = Record<string, (...args: any[]) => void>

/**
 * persist options for {@link $state}
 */
export type PersistOption<State extends object, Paths extends Path<State>[] = []> = {
  /**
   * whether to enable persist
   */
  enable: boolean
  /**
   * localStorage like api
   */
  storage?: StorageLike
  /**
   * identifier in storage
   */
  key?: string
  /**
   * serializer for persist state
   */
  serializer?: Serializer<FlattenType<PartialObject<State, Paths>>>
  /**
   * object paths to persist, using {@link https://github.com/react-earth/object-standard-path object-standard-path}
   * @example ['test.ts','idList[0]']
   */
  paths?: Paths | undefined
}
type PartialObject<
  T extends object,
  K extends Path<T>[],
  V = Record<string, any>,
> = K['length'] extends 0 ? T : K['length'] extends 1 ? {
  [P in Extract<K[0], string>]: PathValue<T, P>;
} : K extends [infer A, ...infer B] ? B extends any[] ? V & {
  [P in Extract<A, string>]: PathValue<T, Extract<A, string>>;
} & PartialObject<T, B, V> : V & {
  [P in Extract<A, string>]: PathValue<T, Extract<A, string>>;
} : never
type FlattenType<T> = T extends infer U ? ConvertType<{
  [K in keyof U]: U[K];
}> : never
type ConvertType<T> = {
  [K in keyof T as K extends `${infer A}.${string}` ? A : K]: K extends `${string}.${infer B}` ? ConvertType<{
    [P in B]: T[K];
  }> : T[K];
}
export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

/**
 * serializer type for {@link $state}
 */
export interface Serializer<State> {
  /**
   * Serializes state into string before storing
   * @default JSON.stringify
   */
  write: (value: State) => string

  /**
   * Deserializes string into state before hydrating
   * @default JSON.parse
   */
  read: (value: string) => State
}

export type StateFunction<T> = (stateName: string, log: (...args: any[]) => void) => T
