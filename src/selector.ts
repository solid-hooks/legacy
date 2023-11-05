import { createSelector } from 'solid-js'
import type { EqualityCheckerFunction, SignalOptions } from 'solid-js/types/reactive/signal'
import type { AnyFunction } from '@subframe7536/type-utils'
import type { SignalObject } from './signal'
import { $ } from './signal'

/**
 * type of {@link $selector}
 */
export type SelectorObject<T, U = T> = SignalObject<T> & {
  /**
   * bind value, call {@link createSelector}
   */
  $bind: (k: U) => boolean
}

/**
 * options for {@link $selector}
 */
export type SelectorObjectOptions<T, U = T> = SignalOptions<T> & {
  /**
   * selector name
   */
  selectorName?: string
  /**
   * select equal check function
   */
  selectorEqual?: EqualityCheckerFunction<T, U>
}

/**
 * object wrapper for {@link createSelector}
 * @param value initial value
 * @param options selector options
 * @see https://github.com/subframe7536/solid-dollar#selector
 */
export function $selector<T, U = T>(
  value: T,
  options?: SignalOptions<T> & SelectorObjectOptions<T, U>,
): SelectorObject<T, U>
/**
 * object wrapper for {@link createSelector}
 * @param existSignal exist SignalObject
 * @see https://github.com/subframe7536/solid-dollar#selector
 */
export function $selector<T, U = T>(
  existSignal: SignalObject<T>,
  options?: SelectorObjectOptions<T, U>
): SelectorObject<T, U>
export function $selector<T, U = T>(
  value: T | SignalObject<T>,
  { selectorEqual, selectorName, ...options }: SignalOptions<T> & SelectorObjectOptions<T, U> = {},
): SelectorObject<T, U> {
  const result = typeof value === 'function' ? value : $(value, options)
  // @ts-expect-error assign
  result.$bind = createSelector<T, U>(
    result as AnyFunction,
    selectorEqual,
    { name: selectorName },
  )
  return result as SelectorObject<T, U>
}
