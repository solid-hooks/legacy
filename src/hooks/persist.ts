import { untrack } from 'solid-js'
import { createEventListener } from '@solid-primitives/event-listener'
import { reconcile, unwrap } from 'solid-js/store'
import type { BaseOptions } from 'solid-js/types/reactive/signal'
import type { AnyFunction } from '@subframe7536/type-utils'
import type { SignalObject } from '../signal'
import { $store, type StoreObject } from '../store'

/**
 * serializer type for {@link $state}
 */
export type Serializer<State> = {
  /**
   * Serializes state into string before storing
   * @default JSON.stringify
   */
  write: (value: State) => string

  /**
   * Deserializes string into state before hydrating
   * @default JSON.parse
   */
  read: (value: string) => State
}

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export type AnyStorage = StorageLike | {
  [K in keyof StorageLike]: (
    ...args: Parameters<StorageLike[K]>
  ) => Promise<ReturnType<StorageLike[K]>>
}

/**
 * options of {@link usePersist}
 */
export type PersistOptions<T, S extends AnyStorage> = {
  /**
   * sync or async storage
   * @default localStorage
   */
  storage?: S
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
  /**
   * custom write function
   * @param storage storage
   * @param key storage key
   * @param value raw value
   * @param writeFn write function
   */
  writeStorage?: (storage: S, key: string, value: T, writeFn: Serializer<T>['write']) => void
}

/**
 * auto persist value to storage(sync or async)
 * @param key storage key
 * @param signal original signal
 * @param options persist options
 * @see https://github.com/subframe7536/solid-dollar#usepersist
 */
export function usePersist<T, S extends AnyStorage>(
  key: string,
  signal: SignalObject<T>,
  options?: PersistOptions<T, S>,
): SignalObject<T>
/**
 * auto persist value to storage(sync or async)
 * @param key storage key
 * @param store original store
 * @param options persist options
 * @see https://github.com/subframe7536/solid-dollar#usepersist
 */
export function usePersist<T extends object, S extends AnyStorage>(
  key: string,
  store: T,
  options?: PersistOptions<T, S> & (T extends StoreObject<any> ? {} : BaseOptions),
): StoreObject<T extends StoreObject<infer A> ? A : T>
/**
 * auto persist value to storage(sync or async)
 * @param key storage key
 * @param store original store
 * @param options persist options
 * @see https://github.com/subframe7536/solid-dollar#usepersist
 */
export function usePersist<T extends object, S extends AnyStorage>(
  key: string,
  store: StoreObject<T>,
  options?: PersistOptions<T, S>,
): StoreObject<T>
export function usePersist<T extends object, S extends AnyStorage>(
  key: string,
  value: T | SignalObject<T> | StoreObject<T>,
  options: PersistOptions<T, S> & BaseOptions = {},
): SignalObject<T> | StoreObject<T> {
  const {
    serializer: { read, write } = {
      read: JSON.parse,
      write: JSON.stringify,
    },
    storage = localStorage,
    listenEvent,
    name,
    writeStorage,
  } = options

  let isStore = false
  let _val: StoreObject<T> | SignalObject<T>
  if (typeof value !== 'function') {
    _val = $store(value, { name })
    isStore = true
  } else {
    _val = value
  }
  if (!isStore && (untrack(_val) as any).$PROXY) {
    isStore = true
  }
  const setVal = _val.$set as AnyFunction

  let unchanged = 1

  const writeValue = writeStorage
    ? (data = unwrap(_val())) => writeStorage(storage as S, key, data, write)
    : (data = unwrap(_val())) => storage.setItem(key, write(data))

  const updateValue = isStore
    ? (data: T) => setVal(reconcile(data, { merge: true }))
    : setVal

  const handleInit = (data: string | null) =>
    data === null || data === undefined ? writeValue() : updateValue(read(data))

  const init = storage.getItem(key)
  init instanceof Promise
    ? init.then(data => unchanged && handleInit(data))
    : handleInit(init)

  _val.$set = (...data) => {
    const result = setVal(...data)
    const currentValue = isStore ? untrack(() => unwrap(_val())) : result
    currentValue === null ? storage.removeItem(key) : writeValue(currentValue)
    unchanged && unchanged--
    return result
  }

  listenEvent && createEventListener(
    window,
    'storage',
    ({ storageArea, key: eventKey, newValue }) => {
      eventKey === key && storageArea === storage && updateValue(
        newValue ? read(newValue) : null,
      )
    },
  )

  return _val
}
