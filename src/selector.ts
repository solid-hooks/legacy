import { createDeferred, createSelector } from 'solid-js'
import type { Accessor, EqualityCheckerFunction } from 'solid-js/types/reactive/signal'
import type { SignalObject, SignalObjectOptions } from './signal'
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
  value: T | Accessor<T> | SignalObject<T>,
  options: SelectorObjectOptions<T, U> = {},
): SelectorObject<T, U> {
  const { selectorEqual, selectorName, ...op } = options
  const _ = (typeof value === 'function' ? value : $(value, op)) as SelectorObject<T, U>
  const change = createSelector<T, U>(_, selectorEqual, { name: selectorName })
  _.$bind = change
  return _
}

/**
 * defer update notification until browser idle
 *
 * alias for {@link createDeferred}
 */
export const $deferred = createDeferred