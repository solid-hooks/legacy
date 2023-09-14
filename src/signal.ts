import type { Accessor, Setter, Signal, SignalOptions } from 'solid-js'
import { batch, createSignal, untrack } from 'solid-js'
import { deepClone } from './state/utils'

/**
 * a symbol to prevent setting value in {@link $} preSet option
 */
export const NORETURN = Symbol('do not use return in preSet')
/**
 * a util function to for {@link $} to prevent setting value when `preSet`
 */
export function noReturn(cb: () => any): typeof NORETURN {
  cb()
  return NORETURN
}
export type SignalParam<T> = [value: T, options?: SignalObjectOptions<T>]

type SetterHooks<T> = {
  /**
   * trigger before initialize and setter
   *
   * the original value will be replaced by the return value
   *
   * to prevent replacement, return {@link NORETURN}
   *
   * @example
   * ```ts
   * import { $, noReturn } from 'solid-dollar'
   * const count = $<number>(1, {
   *   preSet: v => noReturn(() => console.log(v)),
   * })
   * ```
   */
  preSet?: (oldValue: T) => T | typeof NORETURN
  /**
   * trigger post initialize and setter
   */
  postSet?: (newValue: T) => void
  /**
   * enable triggers after initialized
   */
  defer?: boolean
  /**
   * deepclone previous value when $set
   * @example
   * ```ts
   * const list = $([], { deep: true })
   * list.$set((l) => {
   *   l.push(1)
   *   return l
   * })
   * console.log(list()) // [1]
   * ```
   */
  deep?: boolean
}

type SignalObjectOptions<T> = SignalOptions<T> & SetterHooks<T>

/**
 * type of {@link $}
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
 * object wrapper with setter hooks for {@link createSignal}
 * @param args original signal options or signal
 */
export function $<T>(...args: []): SignalObject<T | undefined>
export function $<T>(...args: [Signal<T>]): SignalObject<T>
export function $<T>(...args: SignalParam<T>): SignalObject<T>
export function $<T>(...args: [] | [Signal<T>] | SignalParam<T>) {
  const { preSet, postSet, defer, deep, ...options } = args?.[1] || {}

  const _pre = (value: T) => {
    const ret = preSet?.(value)
    return (!preSet || ret === NORETURN) ? value : ret as T
  }

  const _post = (value: T) => {
    postSet?.(value)
    return value
  }

  const [val, set] = (args.length && isSignal<T>(args[0]))
    ? args[0]
    // eslint-disable-next-line solid/reactivity
    : createSignal(defer ? args[0] as T : _pre(args[0] as T), options)

  !defer && _post(untrack(val))

  const _set = (v: any) => _post(set(_pre(
    typeof v === 'function'
      ? batch(() => (v as any)(deep ? deepClone(untrack(val)) : untrack(val)))
      : v,
  ) as any))

  // @ts-expect-error assign
  val.$set = _set
  // @ts-expect-error assign
  val.$signal = [val, _set]
  return val
}
/**
 * wrapper for {@link untrack}
 */
export function $$<T>(signal: Accessor<T> | SignalObject<T>): T {
  return untrack(signal)
}
