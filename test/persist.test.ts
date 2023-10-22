import { afterEach, describe, expect, it } from 'vitest'
import { createRoot } from 'solid-js'
import { usePersist, useTick } from '../src/hooks'
import { $, $store } from '../src'

describe('useStorage', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('object', async () => {
    const KEY = 'custom-key-object'
    expect(localStorage.getItem(KEY)).toStrictEqual(null)
    const store = usePersist(KEY, $store({ name: 'a', data: 123 }))

    await useTick()
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

    const state = createRoot(() => usePersist(KEY, $<number | null>(0), {
      serializer: { read: data => +data, write: data => `${data! + 1}` },
    }))

    expect(localStorage.getItem(KEY)).toBe('1')
    expect(state()).toBe(0)

    state.$set(null)
    expect(localStorage.getItem(KEY)).toBe(null)
  })
  it('async storage', async () => {
    const KEY = 'custom-key-async-storage'
    const map = new Map<string, string>()

    const state = createRoot(() => usePersist(KEY, $<number | null>(1), {
      storage: {
        async getItem(key) {
          return map.get(key) ?? null
        },
        async setItem(key, value) {
          map.set(key, value)
        },
        async removeItem(key) {
          map.delete(key)
        },
      },
    }))

    await useTick()
    expect(map.get(KEY)).toBe('1')
    expect(state()).toBe(1)

    state.$set(null)
    expect(map.get(KEY)).toBe(undefined)
  })
})
