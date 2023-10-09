import { createSelector } from 'solid-js'
import type { EqualityCheckerFunction, SignalOptions } from 'solid-js/types/reactive/signal'
import type { SignalObject } from './signal'
import { $ } from './signal'

/**
 * type of {@link $selector}
 */
export type SelectorObject<T, U = T> = SignalObject<T> & {
  /**
   * bind value
   */
  $bind: (k: U) => boolean
}

export type SelectorObjectOptions<T, U = T> = SignalOptions<T> & {
  selectorEqual?: EqualityCheckerFunction<T, U>
}

/**
 * object wrapper for {@link createSelector}, return {@link SignalObject}
 * @example
 * ```tsx
 * const activeId = $selector(0)
 * activeId.$(1)
 *
 * <For each={list()}>
 *   {item => <li classList={{ active: activeId.$bind(item.id) }}>
 *     {item.name}
 *    </li>}
 * </For>
 * ```
 */
export function $selector<T, U = T>(
  value: T | SignalObject<T>,
  options: SelectorObjectOptions<T, U> = {},
): SelectorObject<T, U> {
  const _ = $(value as T, options) as SelectorObject<T, U>
  _.$bind = createSelector<T, U>(_, options.selectorEqual, {
    name: options.name ? `$selector-${options.name}` : undefined,
  })
  return _
}
