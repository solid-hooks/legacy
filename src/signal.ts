import type { Accessor, Setter, Signal, SignalOptions } from 'solid-js'
import { createSignal, untrack } from 'solid-js'

export type SignalParam<T> = [value: T, options?: SignalObjectOptions<T>]
type SignalObjectOptions<T> = SignalOptions<T> & {
  onGet?: (value: T) => void
  onSet?: (newValue: T) => void
}
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
 * object wrapper for `createSignal`, allow to setup get/set hooks
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

  const _get = () => {
    const ret = val()
    args?.[1]?.onGet?.(ret)
    return ret
  }
  const _set: Setter<T> = (...v) => {
    const ret = set(...v as any)
    args?.[1]?.onSet?.(ret)
    return ret
  }
  return Object.assign(
    _get,
    { $set: _set, $signal: [_get, _set] },
  )
}
/**
 * wrapper for `untrack`
 */
export function $$<T>(signal: Accessor<T> | SignalObject<T>): T {
  return untrack(signal)
}
