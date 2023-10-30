import type { $TRACK, EffectFunction, MemoOptions } from 'solid-js'
import { createMemo } from 'solid-js'
import type { AnyFunction } from '@subframe7536/type-utils'

/**
 * type of {@link $memo}
 */
export type MemoObject<T> = {
  (): T
  /**
   * type only marker
   */
  [$TRACK]: 'type-only-marker'
}

/**
 * type of {@link $memo} with initial value
 */
export type InitializedMemoObjectOptions<T> = MemoOptions<T> & {
  /**
   * initial value
   */
  value: T
}

/**
 * object wrapper for {@link createMemo}
 * @param fn memo accessor
 * @param options memo options
 * @see https://github.com/subframe7536/solid-dollar#memo
 */
export function $memo<T>(
  fn: EffectFunction<T | undefined, T>,
  options?: MemoOptions<T>
): MemoObject<T>
/**
 * object wrapper for {@link createMemo} with initial value
 * @param fn memo accessor
 * @param options memo options
 * @see https://github.com/subframe7536/solid-dollar#memo
 */
export function $memo<T>(
  fn: EffectFunction<T>,
  options: InitializedMemoObjectOptions<T>
): MemoObject<T>
export function $memo<T>(
  fn: AnyFunction,
  options: MemoOptions<T> | InitializedMemoObjectOptions<T> = {},
): MemoObject<T> {
  return createMemo(
    fn,
    (options as any).value,
    options,
  ) as MemoObject<T>
}
