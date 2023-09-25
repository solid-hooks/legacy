import { createSelector } from 'solid-js'
import type { EqualityCheckerFunction } from 'solid-js/types/reactive/signal'
import type { SignalObject, SignalObjectOptions } from '../signal'
import { $ } from '../signal'

/**
 * type of {@link $selector}
 */
export type SelectorObject<T, U = T> = SignalObject<T> & {
  /**
   * bind value
   */
  $bind: (k: U) => boolean
}

export type SelectorObjectOptions<T, U = T> = SignalObjectOptions<T> & {
  selectorName?: string
  selectorEqual?: EqualityCheckerFunction<T, U>
}

/**
 * object wrapper for {@link createSelector}
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
  defaultValue: T,
  options: SelectorObjectOptions<T, U> = {},
): SelectorObject<T, U> {
  const { selectorEqual, selectorName, ...op } = options
  const _ = $(defaultValue, op) as SelectorObject<T, U>
  const change = createSelector<T, U>(_, selectorEqual, { name: selectorName })
  _.$bind = change
  return _
}