import type { EffectFunction, MemoOptions } from 'solid-js'
import { createMemo } from 'solid-js'

export type MemoObject<T> = {
  (): T
}

/**
 * object wrapper for `createMemo`
 * @param data memo data
 */
export function $memo<T>(data: T): MemoObject<T>
export function $memo<T>(
  data: EffectFunction<T | undefined, T>,
  value?: T,
  option?: MemoOptions<T>
): MemoObject<T>
export function $memo<T>(
  data: T | EffectFunction<T | undefined, T>,
  value?: T,
  option?: MemoOptions<T>,
): MemoObject<T> {
  const memo = createMemo(
    typeof data === 'function'
      ? data as EffectFunction<T | undefined, T>
      : () => data,
    value,
    option,
  )
  return memo
}
