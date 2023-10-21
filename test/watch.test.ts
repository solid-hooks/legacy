import { describe, expect, it, vi } from 'vitest'
import { createRoot } from 'solid-js'
import { $, $watch } from '../src'
import { useTick } from '../src/hooks'

describe('$watch', () => {
  it('basic', async () => {
    const value = $(0)
    const callback = vi.fn()

    createRoot(() => $watch(value, callback, { defer: true }))

    await useTick()
    value.$set(1)
    await useTick()
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(1, undefined)

    value.$set(2)
    await useTick()
    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(2, 1)
  })

  it('filter', async () => {
    const str = $('old')
    const callback = vi.fn()
    const filterFn = (newValue: string) => {
      return newValue !== 'new'
    }

    createRoot(() => $watch(str, callback, { filterFn, defer: true }))

    await useTick()
    str.$set('new')
    await useTick()
    expect(callback).toHaveBeenCalledTimes(0)

    str.$set('new new')
    await useTick()
    expect(callback).toHaveBeenCalledTimes(1)

    // cannot filter old value
    expect(callback).toHaveBeenCalledWith('new new', 'new')
  })

  it('pause & resume', async () => {
    createRoot(async () => {
      const value = $(0)
      const callback = vi.fn()

      const { pause, resume, isWatching } = $watch(value, callback, { defer: true })

      await useTick()
      value.$set(100)
      await useTick()
      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith(100, undefined)

      pause()
      expect(isWatching()).toBe(false)
      value.$set(200)
      await useTick()
      expect(callback).toHaveBeenCalledTimes(1)

      resume()
      value.$set(300)
      await useTick()
      expect(callback).toHaveBeenCalledTimes(2)

      // cannot filter old value
      expect(callback).toHaveBeenCalledWith(300, 200)
    })
  })
})
