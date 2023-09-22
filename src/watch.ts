import type { Accessor, AccessorArray, OnOptions } from 'solid-js'
import { batch, createEffect, createReaction, createRenderEffect, createSignal, on, onCleanup } from 'solid-js'
import type { SignalObject } from './signal'

export type Cleanupable = void | (() => void)

/**
 * {@link $watch} callback function
 * @param value current value
 * @param oldValue previous value
 * @description when using options.filter, `prevInput` will fail to filter
 */
export type WatchCallback<S> = (
  value: S,
  oldValue: S | undefined,
) => Cleanupable

/**
 * {@link $watch} options
 */
export type WatchOptions<T> = OnOptions & {
  /**
   * function for trigger callback, like `debounce()` or `throttle()` in `@solid-primitives/scheduled`
   */
  triggerFn?: (fn: WatchCallback<T>) => WatchCallback<T>
  /**
   * function for filter value
   */
  filterFn?: (newValue: T, times: number) => boolean
}

export type WatchObject = {
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
 * wrapper for {@link createReaction}
 */
export function $watchOnce<T>(deps: Accessor<T>, cb: WatchCallback<T>) {
  const old = deps()
  return createReaction(() => cb(deps(), old))(deps)
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
  options: WatchOptions<T> = {},
): WatchObject {
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
  const _fn = (value: T, oldValue: T | undefined) => {
    setCallTimes(time => time + 1)
    return (triggerFn ? triggerFn(fn) : fn)(value, oldValue)
  }
  createEffect(on(deps, (value, oldValue) => {
    if (needToTriggerEffect(value)) {
      const cleanup = _fn(value, oldValue)
      typeof cleanup === 'function' && onCleanup(cleanup)
    }
  }, { defer }))

  return {
    pause: () => setIsWatch(false),
    resume: () => setIsWatch(true),
    isWatching: () => isWatch(),
    runWithoutEffect: (update: () => void) => {
      setIsWatch(false)
      batch(() => update())
      setIsWatch(true)
    },
  }
}

/**
 * alias for {@link createEffect}
 */
export const $effect = createEffect
/**
 * alias for {@link createRenderEffect}
 */
export const $renderEffect = createRenderEffect