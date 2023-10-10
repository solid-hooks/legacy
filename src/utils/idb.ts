import { createComputed, createSignal, on, onCleanup } from 'solid-js'
import type { Setter, SignalOptions } from 'solid-js'
import type { UseStore } from 'idb-keyval'
import { createStore, del, get, set } from 'idb-keyval'

/**
 * alias for idb-keyval {@link createStore}
 */
export const useIDBStore = createStore
/**
 * type of {@link $idb}
 */
export type IDBObject<T> = {
  (): T
  /**
   * setter, update at next tick
    */
  $: Setter<T>
  /**
   * delete item, set value to `null`
   */
  $del: () => Promise<void>
}

export type IDBOptions = {
  /**
   * whether to cover default value on init
   * @default true
   */
  writeDefaults?: boolean
  /**
   * trigger on error
   * @default console.error
   */
  onError?: (err: unknown) => void
  /**
   * custom {@link UseStore}
   */
  customStore?: UseStore
}

/**
 * create function to generate `$()` like IndexedDB wrapper
 *
 * using {@link https://github.com/jakearchibald/idb-keyval idb-keyval}
 *
 * no serializer, be caution when store `Proxy`
 * @param key target key
 * @param defaultValue default value
 * @param options options
 * @see https://github.com/subframe7536/solid-dollar#idb
 */
export function $idb<T>(
  key: string,
  defaultValue?: T,
  options: SignalOptions<T | undefined> & IDBOptions = {},
): IDBObject<T> {
  const {
    writeDefaults = true,
    onError = console.error,
    customStore,
    name,
    ..._options
  } = options
  const [val, setVal] = createSignal(defaultValue, {
    name: name || `$idb-${key}`,
    ..._options,
  })
  let unChanged: 1 | null = 1
  const read = async () => {
    if (!unChanged) {
      return
    }
    try {
      const existValue = await get(key, customStore)
      if (existValue !== undefined) {
        setVal(existValue)
        return
      }
      defaultValue !== undefined
        && writeDefaults
        && await set(key, defaultValue, customStore)
    } catch (err) {
      onError(err)
    }
  }
  read()

  createComputed(on(
    val as any,
    (data: T) => data !== null && set(key, data, customStore).catch(onError),
    { defer: !writeDefaults },
  ))

  // @ts-expect-error assign
  val.$ = (data) => {
    unChanged && (unChanged = null)
    return setVal(data)
  }
  // @ts-expect-error assign
  val.$del = () => del(key, customStore)
    .then(() => setVal(null as any))
    .catch(onError)
  return val as IDBObject<T>
}

/**
 * type of {@link $idbRecord}
 */
export type IDBRecord<K extends IDBValidKey, V> = {
  (): V | undefined
  $: {
    /**
     * get current key
     */
    (): K
    /**
     * change key, update at next tick
     */
    (currentKey: K): void
    /**
     * set key value, update at next tick, signal will not change
     */
    (currentKey: K, data: V): void
  }
}

export type IDBRecordOptions<K extends IDBValidKey> = {
  /**
   * default record key
   */
  defaultKey?: K
  /**
   * trigger on error
   * @default console.error
   */
  onError?: (err: unknown) => void
  /**
   * cache instance
   */
  cache?: {
    has: (key: K) => boolean
    clear: () => void
    get: (key: K) => any
    set: (key: K, data: any) => any
  }
}

/**
 * reactive IndexedDB record list
 * @param name db name
 * @param options options
 * @see https://github.com/subframe7536/solid-dollar#idbRecord
 */
export function $idbRecord<Key extends IDBValidKey, Value>(
  name: string,
  options: IDBRecordOptions<Key> = {},
): IDBRecord<Key, Value> {
  const { defaultKey, cache, onError = console.error } = options
  const idb = createStore(`$idb-${name}`, 'record')
  const [val, setVal] = createSignal<Value | undefined>(
    undefined,
    { name: `$idb-record-${name}` },
  )
  let currentKey: Key | undefined = defaultKey
  let unChanged: 1 | null = 1
  onCleanup(() => cache?.clear())
  const handleValue = async (key: Key, data?: Value) => {
    try {
      if (data) {
        unChanged && (unChanged = null)
        await set(key, data, idb)
        return
      }
      if (cache?.has(key)) {
        setVal(cache.get(key) as any)
        return
      }
      const _data = await get<Value>(key, idb)
      if (_data !== undefined) {
        cache?.set(key, _data)
        setVal(_data as any)
      }
    } catch (err) {
      onError(err)
    }
  }
  currentKey && unChanged && handleValue(currentKey)
  // @ts-expect-error assign
  val.$ = (key?: Key, data?: Value) => {
    if (!key) {
      return currentKey
    }
    currentKey = key
    handleValue(key, data)
  }

  return val as IDBRecord<Key, Value>
}
