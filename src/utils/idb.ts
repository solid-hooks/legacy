import type { Setter } from 'solid-js'
import type { UseStore } from 'idb-keyval'
import { clear, createStore as createIDBStore, del, get, set } from 'idb-keyval'
import { $, type SignalObjectOptions } from '../signal'

/**
 * type of {@link useIDB}
 */
export type IDBObject<T> = {
  (): T | undefined
  /**
   * setter function
   */
  $: Setter<T | undefined>
  /**
   * delete item
   */
  $del: () => Promise<void>
}

export type IDBOptions = {
  /**
   * IndexedDB store name, like scope for key-values
   *
   * @default 'kv'
   */
  name?: string
  /**
   * whether to cover default value on init
   */
  writeDefaults?: boolean
}

type IDBFactory = {
  /**
   * source {@link UseStore UseStore} of idb-keyval
   */
  idb: UseStore
  /**
   * delete all key-values
   */
  clearAll: () => Promise<void>
  /**
   * `$()` like wrapper for IndexedDB
   *
   * initial value is undefined, get value at next tick
   * @param key key in IndexedDB
   * @param value initial value
   * @param options options
   */
  useIDB: <T>(
    key: string,
    value?: T,
    options?: SignalObjectOptions<T | undefined>
  ) => IDBObject<T>
}

/**
 * create function to generate `$()` like IndexedDB wrapper
 *
 * using {@link https://github.com/jakearchibald/idb-keyval idb-keyval}
 *
 * no serializer, be caution when store `Proxy`
 * @param options options
 */
export function $idb(
  options: IDBOptions = {},
): IDBFactory {
  const { name = 'kv', writeDefaults = false } = options
  const idb = createIDBStore(name, '$idb')

  const clearCallbackList: (() => void)[] = []

  const clearAll = async () => {
    await clear(idb)
    clearCallbackList.forEach(c => c())
  }

  const useIDB = <T>(
    key: string,
    initialValue?: T,
    { postSet: post, ...options }: SignalObjectOptions<T | undefined> = {},
  ): IDBObject<T> => {
    let unchanged = true
    const val = $(initialValue, {
      name: `$idb-${name}-${key}`,
      ...options,
      postSet(value) {
        value !== undefined && set(key, value, idb)
          .then(() => {
            unchanged && (unchanged = false)
            post?.(value)
          })
      },
    }) as unknown as IDBObject<T>

      // Determine the initial value
      ; ((writeDefaults ? initialValue : undefined) !== undefined
      // if initializeValue is not undefined, set the initial value to indexeddb
      ? set(key, initialValue, idb)
      // otherwise, get value from indexeddb and set to val
      : get(key, idb).then(v => unchanged && v !== undefined && val.$(v)))

    const _del = () => val.$(undefined)
    clearCallbackList.push(_del)

    val.$del = () => del(key, idb).then(_del)
    return val
  }
  return { useIDB, idb, clearAll }
}