import type { Accessor, AccessorArray, OnOptions } from 'solid-js'
import { createEffect, createSignal, on } from 'solid-js'
import type { SignalObject } from './signal'

/**
 * {@link $watch} callback function
 * @param value current value
 * @param oldValue previous value
 * @description when using options.filter, `prevInput` will fail to filter
 */
export type WatchCallback<S> = (
  value: S,
  oldValue: S | undefined,
) => void

/**
 * {@link $watch} options
 */
export type WatchOption<T> = OnOptions & {
  /**
   * function for trigger callback, like `debounce()` or `throttle()` in `@solid-primitives/scheduled`
   */
  triggerFn?: (fn: WatchCallback<T>) => WatchCallback<T>
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
 * object wrapper for {@link createEffect}, using {@link on}
 * @param deps Accessor that need to be watch
 * @param fn {@link WatchCallback callback function}
 * @param options options
 * @returns void
 */
export function $watch<T>(
  deps: Accessor<T> | AccessorArray<T> | SignalObject<T>,
  fn: WatchCallback<T>,
  options: WatchOption<T> = {},
): WatchReturn {
  const [isWatch, setIsWatch] = createSignal(true)
  const [callTimes, setCallTimes] = createSignal(0)
  const { triggerFn, defer = false, filterFn } = options

  const needToTriggerEffect = (newValue: T) => {
    return isWatch()
      ? filterFn
        ? filterFn(newValue, callTimes())
        : true
      : false
  }
  const _fn = triggerFn?.(() => {
    setCallTimes(time => time + 1)
    return fn
  }) || ((value, oldValue) => {
    setCallTimes(time => time + 1)
    return fn(value, oldValue)
  })
  createEffect(on(deps, (value, oldValue) => {
    needToTriggerEffect(value) && _fn(value, oldValue)
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
