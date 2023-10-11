import { createSignal } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { $ } from '../src'

describe('test signal', () => {
  it('$()', () => {
    const foo = $()
    expect(foo()).toBe(undefined)
  })
  it('$(number)', () => {
    const bar = $(1)
    expect(bar()).toBe(1)
    expect(bar.$(4)).toBe(4)
    expect(bar()).toBe(4)
  })
  it('$(createSignal(string))', () => {
    // eslint-disable-next-line solid/reactivity
    const x = $(createSignal('str'))
    expect(x()).toBe('str')
    expect(x.$('test modify')).toBe('test modify')
    expect(x()).toBe('test modify')
  })
})
