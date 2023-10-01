import { batch, untrack } from 'solid-js'
import type { GetterOrActionObject } from './types'

function batchAction<T extends (...args: any) => any>(fn: T): T {
  return ((...args) => batch(() => untrack(() => fn(...args)))) as T
}

export function createActions<T extends GetterOrActionObject>(functions?: T): T {
  if (!functions) {
    return {} as T
  }
  const actions: T = { ...functions }
  for (const [name, fn] of Object.entries(functions)) {
    // @ts-expect-error assign
    actions[name] = batchAction(fn)
  }
  return actions
}
