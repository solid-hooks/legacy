import { batch, untrack } from 'solid-js'
import { klona } from 'klona'
import type { ActionObject } from './types'

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
