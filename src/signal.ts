import type { Accessor, Setter, Signal } from 'solid-js'
import { createSignal, untrack } from 'solid-js'

export type SignalParam<T> = Parameters<typeof createSignal<T>>

export type SignalObject<T> = {
  (): T
  readonly $set: Setter<T>
  readonly $signal: Signal<T>
}

export function isSignal<T>(val: unknown): val is Signal<T> {
  return (
    Array.isArray(val)
    && val.length === 2
    && typeof val[0] === 'function'
    && typeof val[1] === 'function'
  )
}

export function isSignalObject<T>(val: unknown): val is SignalObject<T> {
  return (
    typeof val === 'function'
    && '$set' in val
    && typeof val.$set === 'function'
    && '$signal' in val
    && isSignal(val.$signal)
  )
}

export function $<T>(...args: []): SignalObject<T | undefined>
export function $<T>(...args: [Signal<T>]): SignalObject<T>
export function $<T>(...args: SignalParam<T>): SignalObject<T>
export function $<T>(...args: [] | [Signal<T>] | SignalParam<T>) {
  const [val, set] = args.length === 0
    ? createSignal<T>()
    : isSignal<T>(args[0])
      ? args[0]
      : createSignal(...args as SignalParam<T>)

  const obj = () => val()
  obj.$set = set
  obj.$signal = [val, set]

  return obj
}
export function $$<T>(signal: Accessor<T> | SignalObject<T>): T {
  return untrack(signal)
}
