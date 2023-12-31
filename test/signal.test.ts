import { createSignal } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { $ } from '../src'

describe('test $', () => {
  it('$()', () => {
    const foo = $()
    expect(foo()).toBe(undefined)
  })
  it('$(number)', () => {
    const bar = $(1)
    expect(bar()).toBe(1)
    expect(bar.$set(4)).toBe(4)
    expect(bar()).toBe(4)
  })
  it('$(createSignal(string))', () => {
    const x = $(createSignal('str'))
    expect(x()).toBe('str')
    expect(x.$set('test modify')).toBe('test modify')
    expect(x()).toBe('test modify')
  })
})
