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
export function $<T>(value: T, options?: SignalObjectOptions<T>): SignalObject<T>
export function $<T>(value?: T, {
  postSet,
  preSet,
  defer = false,
  ...options
}: SignalObjectOptions<T> = {}) {
  const _pre = (value: T) => {
    const ret = preSet?.(value)
    return (!preSet || ret === NORETURN) ? value : ret as T
  }

  const [val, set] = (value && isSignal<T>(value))
    ? value
    // eslint-disable-next-line solid/reactivity
    : createSignal(defer ? value as T : _pre(value as T), options)

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
