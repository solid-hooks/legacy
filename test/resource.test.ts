import { describe, expect, it } from 'vitest'
import { $resource } from '../src'
import { $tick } from '../src/utils'

describe('$resource', () => {
  it('returns a resource object with mutate and refetch functions', async () => {
    const fetcher = (source: string) => Promise.resolve(`${source} data`)
    const obj = $resource('source', fetcher)
    expect(obj()).toBe(undefined)
    expect(obj.loading).toBe(true)
    expect(obj.state).toBe('pending')
    expect(obj.$mutate).toBeTypeOf('function')
    expect(obj.$refetch).toBeTypeOf('function')
    await $tick()
    expect(obj()).toBe('source data')
    expect(obj.loading).toBe(false)
    expect(obj.state).toBe('ready')
  })
})
