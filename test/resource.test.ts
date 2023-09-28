import { describe, expect, test } from 'vitest'
import { $resource } from '../src'

describe('$resource', () => {
  test('returns a resource object with mutate and refetch functions', async () => {
    const fetcher = (source: string) => Promise.resolve(`${source} data`)
    const options = {
      $: 'source',
    }
    const obj = $resource(fetcher, options)
    expect(obj()).toBe(undefined)
    expect(obj.loading).toBe(true)
    expect(obj.state).toBe('pending')
    console.log(obj.state)
    await Promise.resolve()
    expect(obj()).toBe('source data')
    expect(obj.state).toBe('ready')
    expect(obj.$mutate).toBeTypeOf('function')
    expect(obj.$refetch).toBeTypeOf('function')
  })
})
