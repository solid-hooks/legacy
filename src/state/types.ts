import type { Path, PathValue } from 'object-standard-path'
import type { SetStoreFunction, Store } from 'solid-js/store'
import type { AnyFunction, RemoveNeverProps } from '@subframe7536/type-utils'
import type { Cleanupable, WatchCallback, WatchObject, WatchOptions } from '../watch'
import type { StoreObject } from '../store'
import type { MemoObject } from '../memo'
import type { AnyStorage, Serializer } from '../hooks/persist'

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
   */
  $reset: () => void
  $subscribe: {
    /**
     * subscribe **full** object change, defer by default, return {@link WatchObject}
     * @param callback watch callback
     * @param options watch options
     */
    (callback: (value: State) => Cleanupable, options?: WatchOptions<State>): WatchObject
    /**
     * subscribe **partial** object change, defer by default, return {@link WatchObject}
     * @param deps watch deps
     * @param callback watch callback
     * @param options watch options
     */
    <S>(
      deps: (value: State) => S,
      callback: WatchCallback<S>,
      options?: WatchOptions<S>
    ): WatchObject
  }
}

/**
 * retrun type of {@link $state}
 */
export type StateObject<
  State,
  Getter = GetterObject,
  Action = ActionObject,
> = Getter & StateUtils<State> & (() => State) & Action & {
  $id: string
}

export type InitialState<State extends object> = State | (() => State | [Store<State>, SetStoreFunction<State>])

export type StateSetup<
  State extends object,
  Getter extends GetterObject,
  Action extends ActionObject,
  Paths extends Path<State>[],
> = {
  /**
   * initial state, support object or Store (return of `createStore`)
   *
   * if is Store, maybe built-in `$patch` and `$reset`
   * will not work as expect
   */
  init: InitialState<State>
  /**
   * functions to get state
   *
   * if the function param is none, use {@link createMemo}
   */
  getters?: StateGetter<State, Getter>
  /**
   * functions to manage state
   */
  actions?: StateAction<State, Action>
  /**
   * persist options for state
   */
  persist?: PersistOptions<State, Paths>
}

export type StateAction<
  State extends object,
  Return extends ActionObject,
> = (
  stateObject: StoreObject<State>,
  utils: StateUtils<State>
) => Return
export type StateGetter<
  State extends object,
  Getter extends GetterObject,
> = (state: State) => Getter

export type GetterObject = Record<string, AnyFunction>
export type ActionObject = Record<string, AnyFunction<void>>

/**
 * persist options for {@link $state}
 */
export type PersistOptions<State extends object, Paths extends Path<State>[] = []> = {
  /**
   * whether to enable persist
   */
  enable: boolean
  /**
   * localStorage like api
   */
  storage?: AnyStorage
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
  /**
   * whether to listen storage event
   * @default true
   */
  listenEvent?: boolean
}
export type PartialObject<
  T extends object,
  K extends Path<T>[],
  V = Record<string, any>,
> = K['length'] extends 0
  ? T
  : K['length'] extends 1
    ? { [P in K[0] & string]: PathValue<T, P> }
    : K extends [infer A, ...infer B]
      ? B extends any[]
        ? V & {
          [P in A & string]: PathValue<T, A & string>
        } & PartialObject<T, B, V>
        : V & {
          [P in A & string]: PathValue<T, A & string>
        }
      : never
export type FlattenType<T> = T extends infer U
  ? ConvertType<{ [K in keyof U]: U[K] }>
  : never
type ConvertType<T> = {
  [K in keyof T as K extends `${infer A}.${string}` ? A : K]: K extends `${string}.${infer B}`
    ? ConvertType<{ [P in B]: T[K] }>
    : T[K];
}

export type StateFunction<T> = (stateName: string, log: AnyFunction<void>) => T

export type AvailableState = StateObject<any> | object

export type ParseGetters<T> = T extends AnyFunction
  ? T extends StateObject<infer _, infer Getters, infer __>
    ? Getters
    : never
  : T extends object
    ? RemoveNeverProps<{ [K in keyof T]: T[K] extends MemoObject<any> ? T[K] : never }>
    : never

export type ParseActions<T> = T extends AnyFunction
  ? T extends StateObject<infer _, infer __, infer Actions>
    ? Actions
    : never
  : T extends object
    ? RemoveNeverProps<{
      [K in keyof T]: T[K] extends AnyFunction ? keyof T[K] extends never ? T[K] : never : never
    }>
    : never

export type StateReturn<T> = <
  Option extends 'getter' | 'action' | 'default' = 'default',
>() => Option extends 'getter'
  ? ParseGetters<T>
  : Option extends 'action'
    ? ParseActions<T>
    : T
