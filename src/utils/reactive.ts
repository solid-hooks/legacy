import { type Path, type PathValue, pathGet, pathSet } from 'object-standard-path'
import type { SignalOptions } from 'solid-js'
import { createSignal } from 'solid-js'

/**
 * type of {@link $reactive}
 */
export type ReactiveObject<T> = {
  (): T
  /**
   * setter function
   */
  $: (value: T | ((prev: T) => T)) => T
}
/**
 * `$()` like wrapper to reactify object props
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
export function $reactive<T, P extends Path<T>>(data: T, path: P, options?: SignalOptions<PathValue<T, P>>): ReactiveObject<PathValue<T, P>> {
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
