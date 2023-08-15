import { createSignal } from 'solid-js'
import { describe, expect, expectTypeOf, test } from 'vitest'
import { $, isSignalObject } from '../src'

describe('test signal', () => {
  test('$()', () => {
    const foo = $()
    expect(foo()).toBe(undefined)
    expect(isSignalObject(foo)).toBe(true)
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
    const x = $(createSignal('str'))
    expect(x()).toBe('str')
    expect(x.$set('test modify')).toBe('test modify')
    expect(x()).toBe('test modify')
    expectTypeOf(x.$signal).toBeArray()
    expectTypeOf(x.$signal[0]).toBeFunction()
    expectTypeOf(x.$signal[1]).toBeFunction()
  })
})
