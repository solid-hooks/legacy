import type { Accessor, AccessorArray, OnOptions } from 'solid-js'
import { batch, createComputed, createEffect, createReaction, createRenderEffect, createSignal, on, onCleanup } from 'solid-js'
import type { Prettify } from '@subframe7536/type-utils'
import type { EffectOptions } from 'solid-js/types/reactive/signal'
import type { SignalObject } from './signal'

export type Cleanupable = void | (() => void)

/**
 * {@link baseWatch} callback function
 * @param value current value
 * @param oldValue previous value
 */
export type WatchCallback<S> = (
  value: S,
  oldValue: S | undefined,
) => Cleanupable

/**
 * options for {@link baseWatch}
 */
type BaseWatchOptions<T> = OnOptions & {
  /**
   * function for trigger callback, like `debounce()` or `throttle()` in `@solid-primitives/scheduled`
   */
  triggerFn?: (fn: WatchCallback<T>) => WatchCallback<T>
  /**
   * function for filter value
   *
   * @alert `oldValue` in {@link WatchCallback} will fail to filter
   */
  filterFn?: (newValue: T, times: number) => boolean
  /**
   * whether to use instant watch (`createComputed`)
   */
  effectFn: typeof createEffect | typeof createComputed | typeof createRenderEffect
}

/**
 * type of {@link baseWatch}
 */
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
export function $watchOnce<T>(deps: Accessor<T>, cb: WatchCallback<T>, options?: EffectOptions) {
  const old = deps()
  return createReaction(
    () => cb(deps(), old),
    options,
  )(deps)
}

/**
 * base watch fn
 */
function baseWatch<T>(
  deps: Accessor<T> | AccessorArray<T> | SignalObject<T>,
  fn: WatchCallback<T>,
  options: BaseWatchOptions<T>,
): WatchObject {
  const [isWatch, setIsWatch] = createSignal(true)
  const [callTimes, setCallTimes] = createSignal(0)
  const { triggerFn, defer = true, filterFn, effectFn } = options

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
  effectFn(on(deps, (value, oldValue) => {
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
 * options for {@link $watch} and so on
 */
export type WatchOptions<T> = Prettify<
  Omit<BaseWatchOptions<T>, 'effectFn'> & {
    /**
     * {@link OnOptions}
     * @default true
     */
    defer?: boolean
  }
>

/**
 * object wrapper for {@link createEffect} and {@link on}, defer by default
 * @param deps Accessor that need to be watch
 * @param fn {@link WatchCallback callback function}
 * @param options options
 * @see https://github.com/subframe7536/solid-dollar#watch
 */
export function $watch<T>(
  deps: Accessor<T> | AccessorArray<T> | SignalObject<T>,
  fn: WatchCallback<T>,
  options: WatchOptions<T> = {},
): WatchObject {
  return baseWatch(deps, fn, { ...options, effectFn: createEffect })
}

/**
 * object wrapper for {@link createComputed} and {@link on}, defer by default
 * @param deps Accessor that need to be watch
 * @param fn {@link WatchCallback callback function}
 * @param options options
 */
export function $watchInstant<T>(
  deps: Accessor<T> | AccessorArray<T> | SignalObject<T>,
  fn: WatchCallback<T>,
  options: WatchOptions<T> = {},
): WatchObject {
  return baseWatch(deps, fn, { ...options, effectFn: createComputed })
}

/**
 * object wrapper for {@link createRenderEffect} and {@link on}, defer by default
 * @param deps Accessor that need to be watch
 * @param fn {@link WatchCallback callback function}
 * @param options options
 */
export function $watchRendered<T>(
  deps: Accessor<T> | AccessorArray<T> | SignalObject<T>,
  fn: WatchCallback<T>,
  options: WatchOptions<T> = {},
): WatchObject {
  return baseWatch(deps, fn, { ...options, effectFn: createRenderEffect })
}
