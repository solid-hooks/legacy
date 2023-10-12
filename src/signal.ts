import type { Setter, Signal, SignalOptions } from 'solid-js'
import { createSignal } from 'solid-js'

/**
 * type of {@link $}
 */
export type SignalObject<T> = {
  (): T
  /**
   * setter function
   */
  $: Setter<T>
}

export function isSignal<T>(val: unknown): val is Signal<T> {
  return (
    Array.isArray(val)
    && val.length === 2
    && typeof val[0] === 'function'
    && typeof val[1] === 'function'
  )
}

/**
 * object wrapper for {@link createSignal}
 */
export function $<T>(): SignalObject<T | undefined>
/**
 * object wrapper for exist signals
 * @param existSignal exist Signal array
 */
export function $<T>(existSignal: Signal<T>): SignalObject<T>
/**
 * object wrapper for {@link createSignal}
 * @param value initial value
 * @param options options
 */
export function $<T>(value: T, options?: SignalOptions<T>): SignalObject<T>
export function $<T>(value?: T, options: SignalOptions<T> = {}) {
  const [val, set] = isSignal<T>(value)
    ? value
    : createSignal(value as T, options)

  // @ts-expect-error assign
  val.$ = set
  return val
}
