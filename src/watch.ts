import type { Accessor, AccessorArray, OnOptions } from 'solid-js'
import { createEffect, createSignal, on } from 'solid-js'

import { type SignalObject } from './signal'

/**
 * when using options.fileter, prevInput will fail to filter
 */
export type WatchCallback<S, Next extends Prev = any, Prev = Next> = (
  input: S,
  prevInput: S | undefined,
  prev: Prev
) => void | Next | Promise<void | Next>

export type WatchOption<T> = OnOptions & {
  /**
   * function for trigger callback, like `debounce()` or `throttle()` in `@solid-primitives/scheduled`
  */
  callFn?: ((fn: (...args: unknown[]) => void) => void)
  /**
  * function for filter value
  */
  filterFn?: (newValue: T, times: number) => boolean
}

type WatchReturn = {
  /**
   * pause watch
   */
  pause: () => void
  /**
   * resume watch
   */
  resume: () => void
  /**
   * watch status
   */
  isWatching: () => boolean
  /**
   * run function without effects
   * @param updater update function
   */
  runWithoutEffect: (updater: () => void) => void
}

/**
 * utils for watch Accessor, base on `createEffect(on())`
 * @param deps Accessor that need to be watch
 * @param fn {@link WatchCallback callback function}
 * @param options options
 * @returns void
 */
export function $watch<T, Next extends Prev, Prev = Next>(
  deps: Accessor<T> | AccessorArray<T> | SignalObject<T>,
  fn: WatchCallback<T, Next, Prev>,
  options: WatchOption<T> = {},
): WatchReturn {
  const [isWatch, setIsWatch] = createSignal(true)
  const [callTimes, setCallTimes] = createSignal(0)
  const { callFn, defer = false, filterFn: filter } = options

  const needToTriggerEffect = (newValue: T) => {
    return isWatch()
      ? filter
        ? filter(newValue, callTimes())
        : true
      : false
  }
  createEffect(on(deps, (value, oldValue, old) => {
    if (!needToTriggerEffect(value)) {
      return
    }
    if (callFn) {
      callFn(() => {
        setCallTimes(time => time + 1)
        fn(value, oldValue, old as any)
      })
    } else {
      setCallTimes(time => time + 1)
      fn(value, oldValue, old as any)
    }
  }, { defer: defer as any }))

  return {
    pause: () => setIsWatch(false),
    resume: () => setIsWatch(true),
    isWatching: () => isWatch(),
    runWithoutEffect: (update: () => void) => {
      setIsWatch(false)
      update()
      setIsWatch(true)
    },
  }
}
