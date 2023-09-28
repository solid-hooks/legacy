import type { Setter, Signal, SignalOptions } from 'solid-js'
import { batch, createComputed, createSignal, on, untrack } from 'solid-js'

/**
 * a symbol to prevent setting value in {@link $} preSet option
 */
export const NORETURN = Symbol('no return')
/**
 * a util function to for {@link $} to prevent setting value when `preSet`
 */
export function noReturn(cb: () => any): typeof NORETURN {
  cb()
  return NORETURN
}
type SignalParam<T> = [value: T, options?: SignalObjectOptions<T>]

type SetterHooks<T> = {
  /**
   * trigger before value is set
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
   * trigger after value is set
   *
   * use {@link createComputed} to track value
   */
  postSet?: (newValue: T) => void
  /**
   * enable triggers after initialized
   */
  defer?: boolean
}

export type SignalObjectOptions<T> = SignalOptions<T> & SetterHooks<T>

/**
 * type of {@link $}
 */
export type SignalObject<T> = {
  (): T
  /**
   * setter function
   */
  $: Setter<T>
  /**
   * original getter and untracked setter
   */
  $signal: Signal<T>
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
  const { preSet, postSet, defer = false, ...options } = args?.[1] || {}

  const _pre = (value: T) => {
    const ret = preSet?.(value)
    return (!preSet || ret === NORETURN) ? value : ret as T
  }

  const [val, set] = (args.length && isSignal<T>(args[0]))
    ? args[0]
    // eslint-disable-next-line solid/reactivity
    : createSignal(defer ? args[0] as T : _pre(args[0] as T), options)

  const _set = (v: any) => set(_pre(
    typeof v === 'function'
      ? batch(() => (v as any)(val()))
      : v,
  ) as any)

  postSet && createComputed(on(val, postSet, { defer }))

  // @ts-expect-error assign
  val.$ = _set
  // @ts-expect-error assign
  val.$signal = [val, (arg: any) => untrack(() => set(arg))]
  return val
}
