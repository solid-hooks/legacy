import { describe, expect, test } from 'vitest'
import { $res } from '../src'

describe('$res', () => {
  test('returns a resource object with mutate and refetch functions', async () => {
    const fetcher = (source: string) => Promise.resolve(`${source} data`)
    const options = {
      $: 'source',
    }
    const resourceObject = $res(fetcher, options)
    expect(resourceObject()).toBe(undefined)
    expect(resourceObject.loading).toBe(true)
    expect(resourceObject.state).toBe('pending')
    console.log(resourceObject.state)
    await Promise.resolve()
    expect(resourceObject()).toBe('source data')
    expect(resourceObject.state).toBe('ready')
    expect(resourceObject.$mutate).toBeTypeOf('function')
    expect(resourceObject.$refetch).toBeTypeOf('function')
  })
})
