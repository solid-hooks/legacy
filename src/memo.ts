import type { $TRACK, EffectFunction, MemoOptions } from 'solid-js'
import { createMemo } from 'solid-js'

/**
 * type of {@link $memo}
 */
export type MemoObject<T> = {
  (): T extends (...args: any) => infer R ? R : T
  /**
   * type only marker
   */
  [$TRACK]: '$memo'
}

/**
 * object wrapper for {@link createMemo}, auto wrap with accessor
 * @param data memo data
 * @see https://github.com/subframe7536/solid-dollar#memo
 */
export function $memo<T>(data: T): MemoObject<T>
/**
 * object wrapper for {@link createMemo}
 * @param accessor memo accessor
 * @param value initial value
 * @param options memo options
 * @see https://github.com/subframe7536/solid-dollar#memo
 */
export function $memo<T>(
  accessor: EffectFunction<T | undefined, T>,
  value?: T,
  options?: MemoOptions<T>
): MemoObject<T>
export function $memo<T>(
  data: T | EffectFunction<T | undefined, T>,
  value?: T,
  options?: MemoOptions<T>,
): MemoObject<T> {
  return createMemo(
    typeof data === 'function'
      ? data as EffectFunction<T | undefined, T>
      : () => data,
    value,
    options,
  ) as MemoObject<T>
}
