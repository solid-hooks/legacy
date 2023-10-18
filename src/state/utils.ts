import { batch, untrack } from 'solid-js'
import { klona } from 'klona'
import type { MaybeAccessor } from '@solid-primitives/utils'
import { access } from '@solid-primitives/utils'
import type { ActionObject, GetterObject, StateObject } from './types'

/**
 * alias for {@link klona}
 */
export const deepClone = klona

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
  return access(state) as Action
}

/**
 * get state getters, type only
 */
export function useGetters<
  State,
  Getter extends GetterObject,
  Action extends ActionObject,
>(state: MaybeAccessor<StateObject<State, Getter, Action>>): Getter {
  return access(state) as Getter
}
