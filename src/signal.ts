import type { Accessor, Setter, Signal, SignalOptions } from 'solid-js'
import { createSignal, untrack } from 'solid-js'
import { deepClone } from './state/utils'

export type SignalParam<T> = [value: T, options?: SignalObjectOptions<T>]
type PostSet<T> = (newValue: T) => void

type SignalObjectOptions<T> = SignalOptions<T> & {
  /**
   * trigger post setter
   */
  postSet?: PostSet<T>
  /**
   * deepclone previous value when $set
   */
  deep?: boolean
}
export type SignalObject<T> = {
  (): T
  readonly $set: Setter<T>
  readonly $signal: Signal<T>
}

function isSignal<T>(val: unknown): val is Signal<T> {
  return (
    Array.isArray(val)
    && val.length === 2
    && typeof val[0] === 'function'
    && typeof val[1] === 'function'
  )
}

/**
 * object wrapper for `createSignal`, allow to setup get/set hooks
 * @param args original signal options or signal
 */
export function $<T>(...args: []): SignalObject<T | undefined>
export function $<T>(...args: [Signal<T>]): SignalObject<T>
export function $<T>(...args: SignalParam<T>): SignalObject<T>
export function $<T>(...args: [] | [Signal<T>] | SignalParam<T>) {
  const { postSet, deep, ...options } = args?.[1] || {}

  const [val, set] = (args.length && isSignal<T>(args[0]))
    ? args[0]
    // eslint-disable-next-line solid/reactivity
    : createSignal(args[0] as T, options)

  const _set: Setter<T> = (v?: T | ((prev: T) => T)) => {
    const value = deep && typeof v === 'function'
      ? (v as any)(deepClone(untrack(val)))
      : v
    const ret = set(value)
    postSet?.(ret)
    return ret
  }
  return Object.assign(
    val,
    { $set: _set, $signal: [val, _set] },
  )
}
/**
 * wrapper for `untrack`
 */
export function $$<T>(signal: Accessor<T> | SignalObject<T>): T {
  return untrack(signal)
}

export function $array<T extends any[]>(array: T, postSet?: PostSet<T>): SignalObject<T> {
  return $(array, { deep: true, postSet })
}