import { batch, createMemo, untrack } from 'solid-js'
import type { MaybeAccessor } from '@solid-primitives/utils'
import type { StoreObject } from '../store'
import type { ActionObject, GetterObject, StateGetter, StateObject } from './types'

export { klona as deepClone } from 'klona'

/**
 * @internal
 */
export function createGetters<
  State extends object = Record<string, any>,
  Getter extends GetterObject = {},
>(
  getters: StateGetter<State, Getter> | undefined,
  store: StoreObject<State>,
  stateName: string,
) {
  const _getters = {} as Readonly<Getter>
  for (const [key, getter] of Object.entries(getters?.(store()) || {})) {
    // @ts-expect-error assign
    _getters[key] = getter.length === 0
      ? createMemo(getter, undefined, { name: `${stateName}-${key}` })
      : getter
  }
  return _getters
}

/**
 * @internal
 */
export function createActions<T extends ActionObject>(functions?: T): T {
  if (!functions) {
    return {} as T
  }
  const actions = {}
  for (const [name, fn] of Object.entries(functions)) {
    // @ts-expect-error assign
    actions[name] = (...args) => batch(() => untrack(() => fn(...args)))
  }
  return actions as T
}

/**
 * get state actions, type only
 */
export function useActions<
  State,
  Getter extends GetterObject,
  Action extends ActionObject,
>(state: MaybeAccessor<StateObject<State, Getter, Action>>): Action {
  return '$patch' in state ? state : state() as Action
}

/**
 * get state getters, type only
 */
export function useGetters<
  State,
  Getter extends GetterObject,
  Action extends ActionObject,
>(state: MaybeAccessor<StateObject<State, Getter, Action>>): Getter {
  return '$patch' in state ? state : state() as Getter
}
