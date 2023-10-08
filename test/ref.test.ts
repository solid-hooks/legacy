import { createEffect, createRoot } from 'solid-js'
import { describe, expect, test, vi } from 'vitest'
import { $ref } from '../src/utils'

describe('test $ref', () => {
  test('basic', () => {
    const value = {
      data: 1,
    }
    const bar = $ref(value, 'data')
    expect(bar()).toBe(1)
    expect(bar.$(4)).toBe(4)
    expect(value.data).toBe(4)
    expect(bar()).toBe(4)
  })
  test('deep prop', () => {
    const value = {
      deep: {
        data: 'str',
      },
    }
    const updatedString = 'updated'
    const bar = $ref(value, 'deep.data')
    expect(bar()).toBe('str')
    expect(bar.$(updatedString)).toBe(updatedString)
    expect(value.deep.data).toBe(updatedString)
    expect(bar()).toBe(updatedString)
  })
  test('effect', async () => {
    const value = {
      data: 1,
    }
    const bar = $ref(value, 'data')
    const fn = vi.fn()
    createRoot(() => createEffect(() => fn(bar())))

    bar.$(2)
    expect(fn).toBeCalledWith(2)
  })
})
