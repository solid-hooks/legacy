import { createEffect, createRoot, createSignal, on } from 'solid-js'
import { describe, expect, expectTypeOf, test, vi } from 'vitest'
import { $, $tick } from '../src'
import { $array } from '../src/signal'

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
  test('hooks', () => {
    const cbSet = vi.fn()
    const bar = $(1, { postSet: v => cbSet(v) })
    expect(bar()).toBe(1)
    expect(bar.$set(2)).toBe(2)
    expect(cbSet).toBeCalledWith(2)
    expect(bar()).toBe(2)
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

  test('deep', async () => {
    const list = $array<number[]>([])
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
})
