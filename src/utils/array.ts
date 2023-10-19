import type { Setter, SignalOptions } from 'solid-js/types/reactive/signal'
import { $ } from '../signal'

/**
 * type of {@link $array}
 */
export type ArrayObject<T> = {
  (): T
  $set: Setter<T>
  $update: (updater: (prev: T) => void) => T
}

/**
 * object wrapper for array signal
 * @param value initial value
 * @param options options
 */
export function $array<T extends any[]>(
  value: T,
  options: SignalOptions<T> = {},
): ArrayObject<T> {
  const arr = $(value, options)
  // @ts-expect-error assign
  arr.$update = updater => setArr(
    (value: T) => {
      let _ = [...value]
      updater(_)
      return _
    },
  )
  return arr as ArrayObject<T>
}
