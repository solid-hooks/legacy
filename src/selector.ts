import { createSelector } from 'solid-js'
import type { EqualityCheckerFunction, Setter, SignalOptions } from 'solid-js/types/reactive/signal'
import type { SignalObject } from './signal'
import { $ } from './signal'

/**
 * type of {@link $selector}
 */
export type SelectorObject<T, U = T> = {
  (): T
  /**
   * setter function
   */
  $set: Setter<T>
  /**
   * bind value, call {@link createSelector}
   */
  $bind: (k: U) => boolean
}

/**
 * options for {@link $selector}
 */
export type SelectorObjectOptions<T, U = T> = SignalOptions<T> & {
  selectorEqual?: EqualityCheckerFunction<T, U>
}

/**
 * object wrapper for {@link createSelector}
 * @param value initial value
 * @param options selector options
 * @see https://github.com/subframe7536/solid-dollar#selector
 */
export function $selector<T, U = T>(
  value: T | SignalObject<T>,
  options: SelectorObjectOptions<T, U> = {},
): SelectorObject<T, U> {
  const _ = $(value as T, options)
  // @ts-expect-error assign
  _.$bind = createSelector<T, U>(_, options.selectorEqual, {
    name: options.name ? `$selector-${options.name}` : undefined,
  })
  return _ as any
}
