import { createComputed, createSignal, on, onCleanup } from 'solid-js'
import type { Setter, SignalOptions } from 'solid-js'
import type { UseStore } from 'idb-keyval'
import { createStore, del, get, set } from 'idb-keyval'
import { lru } from 'tiny-lru'

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
 * @param options options
 */
export function $idb<T>(
  key: string,
  value?: T,
  options: SignalOptions<T | undefined> & IDBOptions = {},
): IDBObject<T> {
  const {
    writeDefaults = true,
    onError = console.error,
    customStore,
    name,
    ..._options
  } = options
  const [val, setVal] = createSignal(value, {
    name: name || `$idb-${key}`,
    ..._options,
  })
  let isUpdated = false
  const read = async () => {
    if (isUpdated) {
      return
    }
    try {
      const existValue = await get(key, customStore)
      if (existValue !== undefined) {
        setVal(existValue)
        return
      }
      value !== undefined
        && writeDefaults
        && await set(key, value, customStore)
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
    !isUpdated && (isUpdated = true)
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
type IDBRecordOptions = {
  /**
   * trigger on error
   * @default console.error
   */
  onError?: (err: unknown) => void
  /**
   * enable LRU cache and set max size
   */
  maxCacheSize?: number
}

/**
 * reactive IndexedDB record list
 * @param name db name
 * @param initialValue default value, will not write to IndexedDB
 * @param onError trigger on error
 */
export function $idbRecord<Key extends IDBValidKey, Value>(
  name: string,
  initialValue?: Value,
  options: IDBRecordOptions = {},
): IDBRecord<Key, Value> {
  const { maxCacheSize, onError = console.error } = options
  const idb = createStore(`$idb-${name}`, 'record')
  const [val, setVal] = createSignal<Value | undefined>(
    initialValue,
    { name: `$idb-record-${name}` },
  )
  let currentKey: IDBValidKey
  const cache = maxCacheSize ? lru<Value>(maxCacheSize) : null
  onCleanup(() => cache?.clear())
  const handleValue = async (key: IDBValidKey, data?: Value) => {
    try {
      if (data) {
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
  // @ts-expect-error assign
  val.$ = (key?: IDBValidKey, data?: Value) => {
    if (!key) {
      return currentKey
    }
    currentKey = key
    handleValue(key, data)
  }

  return val as IDBRecord<Key, Value>
}
