import type { Setter } from 'solid-js'
import { createResource, createSignal } from 'solid-js'
import type { UseStore } from 'idb-keyval'
import { clear, createStore as createIDBStore, del, get, set } from 'idb-keyval'

export type IDBObject<T> = {
  (): T
  readonly $: Setter<Exclude<T, undefined>>
  readonly $del: () => Promise<void>
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

type IDBObjectGenerator<T extends Record<string, any>> = {
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
  useIDB: <K extends keyof T & string>(
    key: K,
    initialValue?: T[K] | undefined
  ) => IDBObject<T[K] | undefined>
}

/**
 * create function to generate `$()` like IndexedDB wrapper
 *
 * using {@link https://github.com/jakearchibald/idb-keyval idb-keyval}
 *
 * no serializer, be caution when store `Proxy`
 */
export function $idb<T extends Record<string, any>>(
  options: IDBOptions = {},
): IDBObjectGenerator<T> {
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

  const useIDB = <K extends keyof T & string>(
    key: K,
    initialValue?: T[K],
  ): IDBObject<T[K] | undefined> => {
    const [val, setVal] = createSignal(initialValue)

    // Determine the initial value
    const _initVal = writeDefaults ? initialValue : undefined
    _initVal !== undefined && _initVal !== null
      // if initializeValue is not undefined or null, set the initial value to indexeddb
      ? set(key, initialValue, idb)
      // otherwise, get value from indexeddb and set to val
      // eslint-disable-next-line solid/reactivity
      : get(key, idb).then(v => !val() && setVal(v))

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
    result.$ = setVal as Setter<T[K]>
    result.$del = () => del(key, idb).then(_del).catch(e => onError?.(e))
    return result
  }
  return { useIDB, idb, clearAll }
}