import { afterEach, describe, expect, it } from 'vitest'
import { createRoot } from 'solid-js'
import { unwrap } from 'solid-js/store'
import { usePersist, useTick } from '../src/hooks'
import { $store } from '../src'

describe('usePersist', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('$store', () => {
    const KEY = 'custom-key-store'
    expect(localStorage.getItem(KEY)).toStrictEqual(null)
    const store = usePersist(KEY, $store({ name: 'a', data: 123 }))

    expect(localStorage.getItem(KEY)).toStrictEqual('{"name":"a","data":123}')
    expect(store()).toStrictEqual({ name: 'a', data: 123 })

    store.$set({ ...store(), name: 'b' })
    expect(localStorage.getItem(KEY)).toStrictEqual('{"name":"b","data":123}')

    store.$set({ ...store(), data: 321 })
    expect(localStorage.getItem(KEY)).toStrictEqual('{"name":"b","data":321}')
  })

  it('object', () => {
    const KEY = 'custom-key-object'
    expect(localStorage.getItem(KEY)).toStrictEqual(null)
    const store = usePersist(KEY, { name: 'a', data: 123 })

    expect(localStorage.getItem(KEY)).toStrictEqual('{"name":"a","data":123}')
    expect(store()).toStrictEqual({ name: 'a', data: 123 })

    store.$set({ ...store(), name: 'b' })
    expect(localStorage.getItem(KEY)).toStrictEqual('{"name":"b","data":123}')

    store.$set({ ...store(), data: 321 })
    expect(localStorage.getItem(KEY)).toStrictEqual('{"name":"b","data":321}')
  })

  it('custom serializer', async () => {
    const KEY = 'custom-key-custom-serializer'
    expect(localStorage.getItem(KEY)).toBe(null)

    const state = createRoot(() => usePersist(KEY, { data: 0 }, {
      serializer: { read: JSON.parse, write: () => '1' },
    }))

    expect(localStorage.getItem(KEY)).toBe('1')
    expect(unwrap(state())).toStrictEqual({ data: 0 })
  })
  it('async storage', async () => {
    const KEY = 'custom-key-async-storage'
    const map = new Map<string, string>()

    const state = createRoot(() => usePersist(KEY, { test: 'test' }, {
      storage: {
        async getItem(key) {
          return map.get(key) ?? null
        },
        async setItem(key, value) {
          map.set(key, value)
        },
      },
    }))

    await useTick()
    expect(map.get(KEY)).toBe('{"test":"test"}')
    expect(unwrap(state())).toStrictEqual({ test: 'test' })
  })
})
