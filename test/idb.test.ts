import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { get, set } from 'idb-keyval'
import { createRoot } from 'solid-js'
import { $idb, $tick } from '../src/utils'
import type { IDBObject } from '../src/utils/idb'

describe('useIDB', () => {
  let foo: IDBObject<string>

  beforeEach(async () => {
    foo = createRoot(() => $idb('foo', 'initial value'))
    await $tick()
  })

  afterEach(async () => {
    await foo.$del()
  })

  test('should set initial value to store', async () => {
    expect(foo()).toBe('initial value')
    expect(await get('foo')).toBe('initial value')
  })

  test('should read initial value from store', async () => {
    await set('bar', 1)
    const bar = $idb('bar', 0, { writeDefaults: false })
    await $tick()
    expect(bar()).toBe(0)
    expect(await get('bar')).toBe(1)
  })

  test('should update the value using $set', async () => {
    foo.$('new value')
    expect(await get('foo')).toBe('new value')
    expect(foo()).toBe('new value')
  })

  test('should delete the value using $del', async () => {
    await foo.$del()
    expect(foo()).toBeNull()
  })
})