import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { get } from 'idb-keyval'
import { $idb, $tick } from '../src'
import type { IDBObject } from '../src/idb'

describe('useIDB', () => {
  const { useIDB, idb } = $idb()
  let foo: IDBObject<string | undefined>

  beforeEach(async () => {
    foo = useIDB('foo', 'initial value')
    await $tick()
  })

  afterEach(async () => {
    await foo.$del()
  })

  test('should return the initial value', () => {
    expect(foo()).toBe('initial value')
  })

  test('should update the value using $set', async () => {
    foo.$set('new value')
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
    const data1 = useIDB('test1')
    const data2 = useIDB('test2')

    data1.$set('test data 1')
    data2.$set('test data 2')

    expect(await get('test1', idb)).toBe('test data 1')
    expect(await get('test2', idb)).toBe('test data 2')

    await clearAll()

    expect(await get('test1', idb)).toBeUndefined()
    expect(await get('test2', idb)).toBeUndefined()
  })
})