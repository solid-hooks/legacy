import { createEffect, createRoot, createSignal, on } from 'solid-js'
import { describe, expect, expectTypeOf, test, vi } from 'vitest'
import { $, noReturn } from '../src'
import { $tick } from '../src/utils/tick'

describe('test signal', () => {
  test('$()', () => {
    const foo = $()
    expect(foo()).toBe(undefined)
    expect(foo.$signal).toBeInstanceOf(Array)
  })
  test('$(number)', () => {
    const bar = $(1)
    expect(bar()).toBe(1)
    expect(bar.$set(4)).toBe(4)
    expect(bar()).toBe(4)
    expectTypeOf(bar.$signal).toBeArray()
    expectTypeOf(bar.$signal[0]).toBeFunction()
    expectTypeOf(bar.$signal[1]).toBeFunction()
  })
  test('$(createSignal(string))', () => {
    // eslint-disable-next-line solid/reactivity
    const x = $(createSignal('str'))
    expect(x()).toBe('str')
    expect(x.$set('test modify')).toBe('test modify')
    expect(x()).toBe('test modify')
    expectTypeOf(x.$signal).toBeArray()
    expectTypeOf(x.$signal[0]).toBeFunction()
    expectTypeOf(x.$signal[1]).toBeFunction()
  })
})
describe('$ options', () => {
  test('deep', async () => {
    const list = $<number[]>([], { deep: true })
    expect(list()).toStrictEqual([])
    list.$set((l) => {
      l.push(1)
      return l
    })
    const fn = vi.fn()
    createRoot(() => createEffect(on(list, v => fn(v))))
    expect(list()).toStrictEqual([1])

    await $tick()
    expect(fn).toBeCalledTimes(1)
    expect(fn).toBeCalledWith([1])
  })
  test('no transform before set', () => {
    const cbPreSet = vi.fn()
    const cbPostSet = vi.fn()
    const bar = createRoot(() => $(1, {
      preSet: v => noReturn(() => cbPreSet(v)),
      postSet: v => cbPostSet(v),
    }))
    expect(bar()).toBe(1)
    expect(cbPreSet).toBeCalledWith(1)
    expect(cbPostSet).toBeCalledWith(1)
    expect(bar.$set(2)).toBe(2)
    expect(cbPreSet).toBeCalledWith(2)
    expect(cbPostSet).toBeCalledWith(2)
    expect(bar()).toBe(2)
  })
  test('transform before set', () => {
    const cb = vi.fn()
    const volume = createRoot(() => $(1, {
      preSet: v => v > 1 ? v / 100 : v,
      postSet: v => cb(v),
    }))
    expect(volume()).toBe(1)
    expect(cb).toBeCalledWith(1)
    expect(volume.$set(20)).toBe(0.2)
    expect(cb).toBeCalledWith(0.2)
    expect(volume()).toBe(0.2)
  })
})