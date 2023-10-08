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

function isSignal<T>(val: unknown): val is Signal<T> {
  return (
    Array.isArray(val)
    && val.length === 2
    && typeof val[0] === 'function'
    && typeof val[1] === 'function'
  )
}

/**
 * object wrapper with setter hooks for {@link createSignal}
 */
export function $<T>(): SignalObject<T | undefined>
/**
 * object wrapper with setter hooks for exist signals
 * @param existSignal exist Signal array
 */
export function $<T>(existSignal: Signal<T>): SignalObject<T>
/**
 * object wrapper with setter hooks for {@link createSignal}
 * @param value initial value
 * @param options options
 */
export function $<T>(value: T, options?: SignalOptions<T>): SignalObject<T>
export function $<T>(value?: T, options: SignalOptions<T> = {}) {
  const [val, set] = (value && isSignal<T>(value))
    ? value
    // eslint-disable-next-line solid/reactivity
    : createSignal(value as T, options)

  // @ts-expect-error assign
  val.$ = set
  return val
}
