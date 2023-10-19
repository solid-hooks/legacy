import { type SignalOptions, createSignal } from 'solid-js'

/**
 * type of {@link $array}
 */
export type ArrayObject<T> = {
  (): T
  $update: (data: T | ((prev: T) => T | void)) => T
}

/**
 * object wrapper for array signal
 * @param value initial value
 * @param options options
 */
export function $array<T extends any[]>(
  value: T,
  options: Omit<SignalOptions<T>, 'equal'> = {},
): ArrayObject<T> {
  const [arr, setArr] = createSignal(
    value,
    { ...options, equals: false },
  )
  // @ts-expect-error assign
  arr.$update = (data: any) => setArr((prev) => {
    if (Array.isArray(data)) {
      return data
    }
    const result = data(prev)
    return result || prev
  })
  return arr as ArrayObject<T>
}
