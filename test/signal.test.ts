import { createSignal } from 'solid-js'
import { describe, expect, expectTypeOf, test, vi } from 'vitest'
import { $ } from '../src'

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
    const cbGet = vi.fn()
    const cbSet = vi.fn()
    const bar = $(1, { onGet: v => cbGet(v), onSet: v => cbSet(v) })
    expect(bar()).toBe(1)
    expect(cbGet).toBeCalledWith(1)
    expect(bar.$set(2)).toBe(2)
    expect(cbSet).toBeCalledWith(2)
    expect(bar()).toBe(2)
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
