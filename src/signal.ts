import type { Accessor, Setter, Signal } from 'solid-js'
import { createSignal, untrack } from 'solid-js'

export type SignalParam<T> = Parameters<typeof createSignal<T>>

/**
 * type of `$()`
 */
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
 * object wrapper for `createSignal`
 * @param args original signal options or signal
 */
export function $<T>(...args: []): SignalObject<T | undefined>
export function $<T>(...args: [Signal<T>]): SignalObject<T>
export function $<T>(...args: SignalParam<T>): SignalObject<T>
export function $<T>(...args: [] | [Signal<T>] | SignalParam<T>) {
  const [val, set] = (args.length && isSignal<T>(args[0]))
    ? args[0]
    // eslint-disable-next-line solid/reactivity
    : createSignal(...args as SignalParam<T>)

  return Object.assign(
    () => val(),
    { $set: set, $signal: [val, set] },
  )
}
/**
 * wrapper for `untrack`
 */
export function $$<T>(signal: Accessor<T> | SignalObject<T>): T {
  return untrack(signal)
}
