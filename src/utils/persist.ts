import { createComputed, on } from 'solid-js'
import type { Accessor, Setter, SignalOptions } from 'solid-js'
import type { Serializer, StorageLike } from '../state/types'
import { $, type SignalObject, isSignal } from '../signal'

type AnyStorage = StorageLike | {
  [K in keyof StorageLike]: (
    ...args: Parameters<StorageLike[K]>
  ) => Promise<ReturnType<StorageLike[K]>>
}

/**
 * options of {@link $persist}
 */
export type PeresistOptions<T> = {
  onPersist?: (value: T) => void
  storage?: AnyStorage
  serializer?: Serializer<T>
}

/**
 * auto persist value to storage(sync or async)
 * @param key storage key
 * @param value default value
 * @param options persist options
 * @see https://github.com/subframe7536/solid-dollar#persist
 */
export function $persist<T>(
  key: string,
  value: T,
  options?: SignalOptions<T> & PeresistOptions<T>,
): SignalObject<T>
/**
 * auto persist value to storage(sync or async)
 * @param key storage key
 * @param signal original signal
 * @param options persist options
 * @see https://github.com/subframe7536/solid-dollar#persist
 */
export function $persist<T>(
  key: string,
  signal: SignalObject<T> | [Accessor<T>, Setter<T>],
  options?: PeresistOptions<T>,
): SignalObject<T>
export function $persist<T>(
  key: string,
  value: any,
  options: SignalOptions<T> & PeresistOptions<T> = {},
): SignalObject<T> {
  const {
    serializer = { read: JSON.parse, write: JSON.stringify },
    storage = localStorage,
    onPersist,
    ...signalOptions
  } = options
  const { read, write } = serializer

  const val = (typeof value !== 'function' || isSignal(value))
    ? $(value, signalOptions)
    : value as SignalObject<T>

  const init = storage.getItem(key)
  let unchanged: 1 | null = 1

  init instanceof Promise
    ? init.then(data => unchanged && data && val.$set(read(data)))
    : init && val.$set(read(init))

  createComputed(on(
    val,
    (data) => {
      const result = val.$set(data as any)
      onPersist?.(result)
      value === null
        ? storage.removeItem(key)
        : storage.setItem(key, write(result))
      unchanged && (unchanged = null)
    },
    { defer: true },
  ))
  return val
}
