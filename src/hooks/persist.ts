import { createSignal, untrack } from 'solid-js'
import { createEventListener } from '@solid-primitives/event-listener'
import type { SetStoreFunction } from 'solid-js/store'
import { createStore, reconcile, unwrap } from 'solid-js/store'
import type { Accessor, BaseOptions, Setter, SignalOptions } from 'solid-js/types/reactive/signal'
import type { AnyFunction } from '@subframe7536/type-utils'
import type { SignalObject } from '../signal'
import type { StoreObject } from '../store'

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

export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

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
 * @param value initial value
 * @param options persist options
 * @see https://github.com/subframe7536/solid-dollar#usepersist
 */
export function usePersist<T extends object, S extends AnyStorage>(
  key: string,
  value: T,
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
  value: T | StoreObject<T>,
  options: PersistOptions<T, S> & BaseOptions = {},
): StoreObject<T> {
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

  let val: Accessor<T>, setVal: SetStoreFunction<T>
  if (typeof value !== 'function') {
    const [store, setStore] = createStore(value, { name })
    val = () => store
    setVal = setStore
  } else {
    val = () => value()
    setVal = value.$set
  }

  let unchanged = 1

  const writeValue = writeStorage
    ? (data = unwrap(val())) => writeStorage(storage as S, key, data, write)
    : (data = unwrap(val())) => storage.setItem(key, write(data))

  const updateValue = (data: T) => setVal(reconcile(data, { merge: true }))

  const handleInit = (data: string | null) =>
    data === null || data === undefined ? writeValue() : updateValue(read(data))

  const init = storage.getItem(key)
  init instanceof Promise
    ? init.then(data => unchanged && handleInit(data))
    : handleInit(init)

  // @ts-expect-error assign
  val.$set = (...data) => {
    setVal(...data as [any])
    writeValue(untrack(() => unwrap(val())))
    unchanged && unchanged--
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

  return val as StoreObject<T>
}
type LocalStorageOptions<T> = Pick<PersistOptions<T, typeof localStorage>, 'listenEvent' | 'serializer'>

/**
 * auto store data into localStorage
 * @param key store key
 * @param value initial value
 * @param options store options
 */
export function useLocalStorage<T>(
  key: string,
  value: T,
  options?: LocalStorageOptions<T> & SignalOptions<T>,
): SignalObject<T>
/**
 * auto store data into localStorage
 * @param key store key
 * @param signal original signal
 * @param options store options
 */
export function useLocalStorage<T>(
  key: string,
  signal: SignalObject<T>,
  options?: LocalStorageOptions<T>,
): SignalObject<T>
export function useLocalStorage<T>(
  key: string,
  value: T | SignalObject<T>,
  options: LocalStorageOptions<T> & SignalOptions<T> = {},
): SignalObject<T> {
  const {
    listenEvent,
    serializer: { read, write } = { read: JSON.parse, write: JSON.stringify },
    ...signalOptions
  } = options

  const existData = localStorage.getItem(key)
  const useExistData = existData !== null
  if (!useExistData) {
    localStorage.setItem(key, write(value))
  }
  let val: Accessor<T>, setVal: Setter<T>
  if (typeof value === 'function') {
    val = () => (value as AnyFunction)()
    setVal = (value as SignalObject<T>).$set
  } else {
    [val, setVal] = createSignal(useExistData ? read(existData) : value, signalOptions)
  }
  // @ts-expect-error assign
  val.$set = (arg?) => {
    const data = setVal(arg)
    localStorage.setItem(key, write(data))
    return data
  }

  listenEvent && createEventListener(
    window,
    'storage',
    ({ storageArea, key: eventKey, newValue }) => {
      eventKey === key && storageArea === localStorage && setVal(
        newValue !== null ? read(newValue) : null,
      )
    },
  )

  return val as SignalObject<T>
}
