import type { Path, PathValue } from 'object-standard-path'
import type { SetStoreFunction, Store } from 'solid-js/store/types/store'

export type StoreObject<T extends object> = {
  (): Store<T>
  readonly $set: SetStoreFunction<T>
}

export type SubscribeCallback<State> = (state: State) => void

type StateUtils<State> = {
  /**
   * update state
   * - `Partial<State>`: using `reconcile` with `merge: true`, merged with previous state
   * - `((state: State) => void)`: using `produce`
   */
  readonly $patch: (state: Partial<State> | ((state: State) => void)) => void
  /**
   * reset state
   */
  readonly $reset: () => void
  /**
   * subscribe to state
   */
  readonly $subscribe: (callback: SubscribeCallback<State>) => () => boolean
}

export type StateObject<State, Action = ActionObject> = Action & StateUtils<State> & (() => State)

export type StateSetup<
  State extends object,
  Action extends ActionObject,
  Paths extends Path<State>[],
> = {
  $init: State | (() => State)
  $action?: ActionFunction<State, Action>
  $persist?: PersistOption<State, Paths>
}

export type ActionFunction<State, Return> = (
  state: State,
  setState: SetStoreFunction<State>,
  utils: StateUtils<State>
) => Return
export type ActionObject = Record<string, (...args: any[]) => void>

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
   * whether to enable debug log
   */
  debug?: boolean
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
