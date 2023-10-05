import type { Setter } from 'solid-js'
import { createComputed, createSignal, on } from 'solid-js'
import type { UseStore } from 'idb-keyval'
import { clear, createStore as createIDBStore, del, get, set } from 'idb-keyval'

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
  ): IDBObject<T> => {
    const [val, setVal] = createSignal(initialValue, {
      name: `$idb-${name}-${key}`,
    })

    let unchanged = true

      // Determine the initial value
      ; ((writeDefaults ? initialValue : undefined) !== undefined
      // if initializeValue is not undefined, set the initial value to indexeddb
      ? set(key, initialValue, idb)
      // otherwise, get value from indexeddb and set to val
      : get(key, idb).then(v => unchanged && v !== undefined && setVal(v)))

    createComputed(on(val, value =>
      value !== undefined && set(key, value, idb).then(() => setVal(value as any)),
    ))

    const _del = () => setVal(undefined)
    clearCallbackList.push(_del)

    const result = () => val()
    result.$ = (!unchanged && (unchanged = false), setVal) as any
    result.$del = () => del(key, idb).then(_del)
    return result
  }
  return { useIDB, idb, clearAll }
}