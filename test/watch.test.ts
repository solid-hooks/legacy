import { describe, expect, test, vi } from 'vitest'
import { createRoot } from 'solid-js'
import { $, $watch } from '../src'
import { $tick } from '../src/utils'

describe('$watch', () => {
  test('basic', async () => {
    const value = $(0)
    const callback = vi.fn()

    createRoot(() => $watch(value, callback, { defer: true }))

    await $tick()
    value.$set(1)
    await $tick()
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(1, undefined)

    value.$set(2)
    await $tick()
    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(2, 1)
  })

  test('filter', async () => {
    const str = $('old')
    const callback = vi.fn()
    const filterFn = (newValue: string) => {
      return newValue !== 'new'
    }

    createRoot(() => $watch(str, callback, { filterFn, defer: true }))

    await $tick()
    str.$set('new')
    await $tick()
    expect(callback).toHaveBeenCalledTimes(0)

    str.$set('new new')
    await $tick()
    expect(callback).toHaveBeenCalledTimes(1)

    // cannot filter old value
    expect(callback).toHaveBeenCalledWith('new new', 'new')
  })

  test('pause & resume', async () => {
    createRoot(async () => {
      const value = $(0)
      const callback = vi.fn()

      const { pause, resume, isWatching } = $watch(value, callback, { defer: true })

      await $tick()
      value.$set(100)
      await $tick()
      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith(100, undefined)

      pause()
      expect(isWatching()).toBe(false)
      value.$set(200)
      await $tick()
      expect(callback).toHaveBeenCalledTimes(1)

      resume()
      value.$set(300)
      await $tick()
      expect(callback).toHaveBeenCalledTimes(2)

      // cannot filter old value
      expect(callback).toHaveBeenCalledWith(300, 200)
    })
  })
})
