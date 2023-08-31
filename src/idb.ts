import type { Setter } from 'solid-js'
import { createResource, createSignal } from 'solid-js'
import type { UseStore } from 'idb-keyval'
import { clear, createStore, del, get, set } from 'idb-keyval'

export type IDBObject<T> = {
  (): T
  readonly $set: Setter<Exclude<T, undefined>>
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
 * using `idb-keyval`
 *
 * no serializer, be caution when store `Proxy`
 */
export function $idb<T extends Record<string, any>>(
  options: IDBOptions = {},
): IDBObjectGenerator<T> {
  const { name = 'kv', onError, writeDefaults = false } = options
  const idb = createStore(name, '$idb')

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
      console.log(value)

      try {
        if (value !== undefined) {
          await set(key, value, idb)
        }
        return value
      } catch (e) {
        onError?.(e)
        return initialValue
      }
    }, { initialValue })

    const _del = () => {
      setVal(undefined)
      mutate(undefined)
    }

    clearCallbackList.push(_del)

    return Object.assign(
      () => data(),
      {
        $set: setVal as Setter<T[K]>,
        $del: async () => {
          try {
            await del(key, idb)
            _del()
          } catch (err) {
            onError?.(err)
          }
        },
      },
    )
  }
  return { useIDB, idb, clearAll }
}