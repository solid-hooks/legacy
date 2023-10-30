import { describe, expect, it, vi } from 'vitest'
import { createRoot } from 'solid-js'
import { $, $watch } from '../src'

describe('$watch', () => {
  it('basic', () => {
    const value = $(0)
    const callback = vi.fn()

    createRoot(() => $watch(value, callback))

    value.$set(1)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(1, undefined, 1)

    value.$set(2)
    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(2, 1, 2)
  })

  it('pause & resume', () => {
    const value = $(0)
    const callback = vi.fn()

    const {
      pause,
      resume,
      isWatching,
    } = createRoot(() => $watch(value, callback))

    value.$set(100)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(100, undefined, 1)

    pause()
    expect(isWatching()).toBe(false)
    value.$set(200)
    resume()
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(100, undefined, 1)

    value.$set(300)
    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(300, 100, 2)
  })
})
