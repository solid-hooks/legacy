import { describe, expect, test } from 'vitest'
import { $cx } from '../src/utils'

// subset of https://github.com/lukeed/clsx/blob/master/test/classnames.js
describe('$cx', () => {
  test('keeps object keys with truthy values', () => {
    const out = $cx({ a: true, b: false, c: 0, d: null, e: undefined, f: 1, g: 'test', h: '' })
    expect(out).toBe('a f g')
  })

  test('joins arrays of class names and ignore falsy values', () => {
    const out = $cx('a', 0, null, undefined, true, 1, 'b')
    expect(out).toBe('a 1 b')
  })

  test('supports heterogenous arguments', () => {
    expect($cx({ a: true }, 'b', 0)).toBe('a b')
  })

  test('should be trimmed', () => {
    expect($cx('', 'b', {}, '')).toBe('b')
  })

  test('returns an empty string for an empty configuration', () => {
    expect($cx({})).toBe('')
    expect($cx([{}, {}])).toBe('')
  })

  test('supports an array of class names', () => {
    expect($cx(['a', 'b'])).toBe('a b')
  })

  test('joins array arguments with string arguments', () => {
    expect($cx(['a', 'b'], 'c')).toBe('a b c')
    expect($cx('c', ['a', 'b'])).toBe('c a b')
  })

  test('handles multiple array arguments', () => {
    expect($cx(['a', 'b'], ['c', 'd'])).toBe('a b c d')
  })

  test('handles arrays that include falsy and true values', () => {
    expect($cx(['a', 0, null, undefined, false, true, 'b'])).toBe('a b')
  })

  test('handles arrays that include arrays', () => {
    expect($cx(['a', ['b', 'c']])).toBe('a b c')
  })

  test('handles arrays that include objects', () => {
    expect($cx(['a', { b: true, c: false }]), 'a b')
  })

  test('handles arrays that are empty', () => {
    expect($cx('a', [])).toBe('a')
  })
})
