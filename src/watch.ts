import type { Prettify } from '@subframe7536/type-utils'
import type { Accessor, AccessorArray, OnOptions } from 'solid-js'
import {
  batch,
  createComputed,
  createEffect,
  createReaction,
  createRenderEffect,
  createSignal,
  onCleanup,
  untrack,
} from 'solid-js'
import type { EffectOptions } from 'solid-js/types/reactive/signal'

export type Cleanupable = void | VoidFunction

/**
 * {@link baseWatch} callback function
 * @param value current value
 * @param oldValue previous value
 */
export type WatchOnceCallback<S> = (
  value: S,
  oldValue: S | undefined,
) => Cleanupable
/**
 * {@link baseWatch} callback function
 * @param value current value
 * @param oldValue previous value
 */
export type WatchCallback<S> = (
  value: S,
  oldValue: S | undefined,
  callTimes: number,
) => Cleanupable

/**
 * options for {@link baseWatch}
 */
type BaseWatchOptions<T> = OnOptions & {
  /**
   * function for trigger callback, like `debounce()` or `throttle()` in `@solid-primitives/scheduled`
   */
  triggerFn?: (fn: Accessor<void>) => Accessor<void>
  /**
   * function for filter value
   */
  filterFn?: (newValue: T, times: number) => boolean
}

/**
 * type of {@link baseWatch}
 */
export type WatchObject = {
  /**
   * pause watch
   */
  pause: VoidFunction
  /**
   * resume watch
   */
  resume: VoidFunction
  /**
   * watch status
   */
  isWatching: Accessor<boolean>
  /**
   * call times
   */
  callTimes: Accessor<number>
  /**
   * run function without effects
   * @param updater update function
   */
  runWithoutEffect: (updater: VoidFunction) => void
}

/**
 * wrapper for {@link createReaction}
 */
export function $watchOnce<T>(deps: Accessor<T>, cb: WatchOnceCallback<T>, options?: EffectOptions) {
  const old = deps()
  return createReaction(() => cb(deps(), old), options)(deps)
}

/**
 * base watch fn
 */
function baseWatch<T>(
  deps: Accessor<T> | AccessorArray<T>,
  fn: WatchCallback<T>,
  options: BaseWatchOptions<T> = {},
  effectFn: typeof createEffect | typeof createComputed | typeof createRenderEffect,
): WatchObject {
  const [isWatching, setIsWatching] = createSignal(true)
  const [callTimes, setCallTimes] = createSignal(0)
  const isArray = Array.isArray(deps)
  let oldValue: T
  let { defer = true, filterFn, triggerFn } = options

  const watcher = () => {
    const value = isArray ? deps.map(dep => dep()) as T : deps()
    if (defer) {
      defer = false
      return
    }
    if (untrack(() => !isWatching() || filterFn?.(value, callTimes()))) {
      return
    }
    const times = setCallTimes(time => ++time)
    const cleanup = untrack(() => fn(value, oldValue, times))
    cleanup && onCleanup(cleanup)
    oldValue = value
  }
  effectFn(triggerFn ? triggerFn(watcher) : watcher)

  return {
    pause: () => setIsWatching(false),
    resume: () => setIsWatching(true),
    isWatching,
    callTimes,
    runWithoutEffect: (update: VoidFunction) => {
      setIsWatching(false)
      batch(() => update())
      setIsWatching(true)
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
 * object wrapper for {@link createEffect}, defer by default
 * @param deps Accessor that need to be watch
 * @param fn {@link WatchCallback callback function}
 * @param options watch options
 * @see https://github.com/subframe7536/solid-dollar#watch
 */
export function $watch<T>(
  deps: Accessor<T> | AccessorArray<T>,
  fn: WatchCallback<T>,
  options: WatchOptions<T> = {},
): WatchObject {
  return baseWatch(deps, fn, options, createEffect)
}

/**
 * object wrapper for {@link createComputed}, defer by default
 * @param deps Accessor that need to be watch
 * @param fn {@link WatchCallback callback function}
 * @param options watch options
 */
export function $watchInstant<T>(
  deps: Accessor<T> | AccessorArray<T>,
  fn: WatchCallback<T>,
  options: WatchOptions<T> = {},
): WatchObject {
  return baseWatch(deps, fn, options, createComputed)
}

/**
 * object wrapper for {@link createRenderEffect}, defer by default
 * @param deps Accessor that need to be watch
 * @param fn {@link WatchCallback callback function}
 * @param options watch options
 */
export function $watchRendered<T>(
  deps: Accessor<T> | AccessorArray<T>,
  fn: WatchCallback<T>,
  options: WatchOptions<T> = {},
): WatchObject {
  return baseWatch(deps, fn, options, createRenderEffect)
}
