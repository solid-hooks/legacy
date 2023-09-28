import { type Path, type PathValue, pathGet, pathSet } from 'object-standard-path'
import type { SignalOptions } from 'solid-js'
import { createSignal } from 'solid-js'

/**
 * type of {@link $ref}
 */
export type RefObject<T> = {
  (): T
  /**
   * setter function
   */
  $: (value: T | ((prev: T) => T)) => T
}
/**
 * `$()` like wrapper to make object props reactive
 *
 * ```ts
 * const value = {
 *   deep: {
 *     data: 'str',
 *   },
 * }
 *
 * const bar = $reactive(value, 'deep.data')
 *
 * bar() // 'str'
 * bar.$('updated') // 'update'
 * bar() // 'updated'
 * ```
*/
export function $ref<T, P extends Path<T>>(data: T, path: P, options?: SignalOptions<PathValue<T, P>>): RefObject<PathValue<T, P>> {
  const { equals, ...op } = options || {}
  const [track, trigger] = createSignal(undefined, { equals: false, ...op })
  const get = () => pathGet(data, path)
  const set = (value: any) => pathSet(data, path, value)

  const result = () => {
    track()
    return get()
  }
  result.$ = (...[arg]: any[]) => {
    const _ = typeof arg === 'function' ? (arg as any)(get()) : arg
    const _equals = typeof equals === 'function'
      ? equals(get(), _)
      : equals === undefined
        ? get() === _
        : !!equals
    if (!_equals) {
      set(_)
      trigger()
    }
    return _
  }
  return result
}
