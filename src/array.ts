import type { AnyFunction } from '@subframe7536/type-utils'
import { createSignal } from 'solid-js'
import type { Setter, SignalOptions } from 'solid-js'

/**
 * type of {@link $array}
 */
export type ArrayObject<T> = {
  (): T
  /**
   * setter function
   */
  $set: Setter<T>
  /**
   * update by mutating it in-place
   */
  $mutate: (mutator: (prev: T) => void) => T
}

/**
 * object wrapper for array signal
 * @param value initial value
 * @param options options
 * @see https://github.com/subframe7536/solid-dollar#array
 */
export function $array<T extends any[]>(
  value: T,
  options: SignalOptions<T> = {},
): ArrayObject<T> {
  const [arr, setArr] = createSignal(value, options)
  // @ts-expect-error assign
  arr.$set = setArr
  // @ts-expect-error assign
  arr.$mutate = (fn: AnyFunction) => setArr((prev) => {
    const _ = [...prev]
    fn(_)
    return _
  })
  return arr as ArrayObject<T>
}
