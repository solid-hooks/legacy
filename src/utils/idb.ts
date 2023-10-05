import { createResource, createSignal } from 'solid-js'
import type { UseStore } from 'idb-keyval'
import { clear, createStore as createIDBStore, del, get, set } from 'idb-keyval'
import type { SignalObject } from '../signal'

/**
 * type of {@link useIDB}
 */
export type IDBObject<T> = Omit<SignalObject<T | undefined>, '$signal'> & {
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
   * call on error
   */
  onError?: (e: unknown) => void
  /**
   * whether to cover default value on init
   */
  writeDefaults?: boolean
}

type IDBObjectGenerator = {
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
   */
  useIDB: <T>(
    key: string,
    initialValue?: T
  ) => IDBObject<T>
}

/**
 * create function to generate `$()` like IndexedDB wrapper
 *
 * using {@link https://github.com/jakearchibald/idb-keyval idb-keyval}
 *
 * no serializer, be caution when store `Proxy`
 */
export function $idb(
  options: IDBOptions = {},
): IDBObjectGenerator {
  const { name = 'kv', onError, writeDefaults = false } = options
  const idb = createIDBStore(name, '$idb')

  const clearCallbackList: (() => void)[] = []

  const clearAll = async () => {
    try {
      await clear(idb)
      clearCallbackList.forEach(c => c())
    } catch (err) {
      onError?.(err)
    }
  }

  const useIDB = <T>(
    key: string,
    initialValue?: T,
  ): IDBObject<T> => {
    const [val, setVal] = createSignal(initialValue, {
      name: `$idb-${name}-${key}`,
    })

    let unchanged = true

    // Determine the initial value
    const _initVal = writeDefaults ? initialValue : undefined
    _initVal !== undefined
      // if initializeValue is not undefined, set the initial value to indexeddb
      ? set(key, initialValue, idb)
      // otherwise, get value from indexeddb and set to val
      : get(key, idb).then(v => unchanged && v !== undefined && setVal(v))

    const [data, { mutate }] = createResource(val, async (value) => {
      try {
        if (value !== undefined) {
          await set(key, value, idb)
        }
        return value
      } catch (err) {
        onError?.(err)
        return initialValue
      }
    }, { initialValue })

    const _del = () => {
      setVal(undefined)
      mutate(undefined)
    }

    clearCallbackList.push(_del)

    const result = () => data()
    result.$ = (!unchanged && (unchanged = false), setVal) as any
    result.$del = () => del(key, idb).then(_del).catch(e => onError?.(e))
    return result
  }
  return { useIDB, idb, clearAll }
}