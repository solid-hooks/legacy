import { createEffect, createRoot } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { $reactive } from '../src'

describe('test $reactive', () => {
  it('basic', () => {
    const value = {
      data: 1,
    }
    const bar = $reactive(value, 'data')
    expect(bar()).toBe(1)
    expect(bar.$set(4)).toBe(4)
    expect(value.data).toBe(4)
    expect(bar()).toBe(4)
  })
  it('deep prop', () => {
    const value = {
      deep: {
        data: {
          test: 'str',
        },
      },
    }
    const updatedString = 'updated'
    const bar = $reactive(value, 'deep.data')
    expect(bar().test).toBe('str')
    expect(bar.$set((prev) => {
      prev.test = updatedString
      return prev
    })).toStrictEqual({ test: updatedString })
    expect(value.deep.data.test).toBe(updatedString)
    expect(bar().test).toBe(updatedString)
  })
  it('effect', async () => {
    const value = {
      data: 1,
    }
    const bar = $reactive(value, 'data')
    const fn = vi.fn()
    createRoot(() => createEffect(() => fn(bar())))

    bar.$set(2)
    expect(fn).toBeCalledWith(2)
  })
})
