import { batch, untrack } from 'solid-js'
import type { GetterOrActionObject } from './types'

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

function batchAction<T extends (...args: any) => any>(fn: T): T {
  return ((...args) => batch(() => untrack(() => fn(...args)))) as T
}

export function createActions<T extends GetterOrActionObject>(functions?: T): Readonly<T> {
  if (!functions) {
    return {} as Readonly<T>
  }
  const actions: T = { ...functions }
  for (const [name, fn] of Object.entries(functions)) {
    // @ts-expect-error assign
    actions[name] = batchAction(fn)
  }
  return actions
}
