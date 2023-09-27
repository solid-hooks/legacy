import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { get } from 'idb-keyval'
import { createRoot } from 'solid-js'
import { $idb, $tick } from '../src/utils'
import type { IDBObject } from '../src/utils/idb'

describe('useIDB', () => {
  const { useIDB, idb } = $idb({ name: 'test' })
  let foo: IDBObject<string>

  beforeEach(async () => {
    foo = createRoot(() => useIDB('foo', 'initial value'))
    await $tick()
  })

  afterEach(async () => {
    await foo.$del()
  })

  test('should return the initial value', () => {
    expect(foo()).toBe('initial value')
  })

  test('should update the value using $set', async () => {
    foo.$('new value')
    expect(await get('foo', idb)).toBe('new value')
    expect(foo()).toBe('new value')
  })

  test('should delete the value using $del', async () => {
    await foo.$del()
    expect(foo()).toBeUndefined()
  })
})
describe('clearAll', () => {
  const { useIDB, clearAll, idb } = $idb()
  test('should clearAll', async () => {
    const data1 = createRoot(() => useIDB<string>('test1'))
    const data2 = createRoot(() => useIDB<number>('test2'))

    data1.$('test data 1')
    data2.$(0)

    expect(await get('test1', idb)).toBe('test data 1')
    expect(await get('test2', idb)).toBe(0)

    await clearAll()

    expect(await get('test1', idb)).toBeUndefined()
    expect(await get('test2', idb)).toBeUndefined()
  })
})