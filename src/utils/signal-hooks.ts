import type { Signal, SignalOptions } from 'solid-js'
import { batch, createComputed, createSignal, on, untrack } from 'solid-js'
import type { SignalObject } from '../signal'
import { isSignal } from '../signal'

/**
 * a symbol to prevent setting value in {@link $signal} preSet option
 */
export const NORETURN = Symbol('no return')
/**
 * a util function to for {@link $signal} to prevent setting value when `preSet`
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

export type SignalHooksObjectOptions<T> =
  SignalOptions<T> & SetterHooks<T>

/**
 * type of {@link $signal}
 */
export type SignalHooksObject<T> = SignalObject<T> & {
  /**
   * original getter and untracked setter
   */
  $source: Signal<T>
}

/**
 * object wrapper with setter hooks for {@link createSignal}
 */
export function $signal<T>(): SignalHooksObject<T | undefined>
/**
 * object wrapper with setter hooks for exist signals
 * @param existSignal exist Signal array
 */
export function $signal<T>(existSignal: Signal<T>): SignalHooksObject<T>
/**
 * object wrapper with setter hooks for {@link createSignal}
 * @param value initial value
 * @param options options
 */
export function $signal<T>(
  value: T,
  options?: SignalHooksObjectOptions<T>
): SignalHooksObject<T>
export function $signal<T>(value?: T, {
  postSet,
  preSet,
  defer = false,
  ...options
}: SignalHooksObjectOptions<T> = {}) {
  const _pre = (value: T) => {
    const ret = preSet?.(value)
    return (!preSet || ret === NORETURN) ? value : ret as T
  }

  const [val, set] = (value && isSignal<T>(value))
    ? value
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
  val.$source = [val, (arg: any) => untrack(() => set(arg))]
  return val
}
