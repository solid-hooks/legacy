import { $PROXY, createComputed, on } from 'solid-js'
import { createEventListener } from '@solid-primitives/event-listener'
import { reconcile } from 'solid-js/store'
import type { Serializer, StorageLike } from '../state/types'
import type { SignalObject } from '../signal'
import type { StoreObject } from '../store'

type AnyStorage = StorageLike | {
  [K in keyof StorageLike]: (
    ...args: Parameters<StorageLike[K]>
  ) => Promise<ReturnType<StorageLike[K]>>
}

/**
 * options of {@link usePersist}
 */
export type PeresistOptions<T> = {
  /**
   * sync or async storage
   * @default localStorage
   */
  storage?: AnyStorage
  /**
   * data serializer
   * @default { read: JSON.parse, write: JSON.stringify }
   */
  serializer?: Serializer<T>
  /**
   * whether to listen window storage event
   * @default false
   */
  listenEvent?: boolean
}

/**
 * auto persist value to storage(sync or async)
 * @param key storage key
 * @param signal original signal
 * @param options persist options
 * @see https://github.com/subframe7536/solid-dollar#usepersist
 */
export function usePersist<T>(
  key: string,
  signal: SignalObject<T>,
  options?: PeresistOptions<T>,
): SignalObject<T>
/**
 * auto persist value to storage(sync or async)
 * @param key storage key
 * @param store original store
 * @param options persist options
 * @see https://github.com/subframe7536/solid-dollar#usepersist
 */
export function usePersist<T extends object>(
  key: string,
  store: StoreObject<T>,
  options?: PeresistOptions<T>,
): StoreObject<T>
export function usePersist<T extends object>(
  key: string,
  value: SignalObject<T> | StoreObject<T>,
  options: PeresistOptions<T> = {},
): SignalObject<T> | StoreObject<T> {
  const {
    serializer = { read: JSON.parse, write: JSON.stringify },
    storage = localStorage,
    listenEvent,
  } = options
  const { read, write } = serializer

  const result = () => value()

  const setVal = (value() as any)[$PROXY]
    ? (data: T) => (value as StoreObject<T>).$set(reconcile(data))
    : (value as SignalObject<T>).$set

  const init = storage.getItem(key)
  let unchanged: 1 | null = 1

  const writeValue = (data = value()) => storage.setItem(key, write(data))

  init instanceof Promise
    ? init.then(async data => unchanged && data
      ? setVal(read(data))
      : await writeValue(),
    )
    : init ? setVal(read(init)) : writeValue()

  result.$set = (data: any) => {
    const _ = setVal(data)
    data === null
      ? storage.removeItem(key)
      : writeValue(data)
    unchanged && (unchanged = null)
    return _
  }

  listenEvent && createEventListener(
    window,
    'storage',
    ({ storageArea, key: eventKey, newValue }) => {
      eventKey === key && storageArea === storage && setVal(
        newValue ? read(newValue) : null,
      )
    },
  )

  return result as any
}
