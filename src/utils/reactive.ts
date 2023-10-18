import { type Path, type PathValue, pathGet, pathSet } from 'object-standard-path'
import type { SignalOptions } from 'solid-js'
import { createSignal } from 'solid-js'
import type { SignalObject } from '../signal'

/**
 * `$()` like wrapper to make plain object props reactive
 * @param data source object
 * @param path object access path, support array access
 * @param options options
 * @see https://github.com/subframe7536/solid-dollar#reactive
 */
export function $reactive<T extends object, P extends Path<T>>(
  data: T,
  path: P,
  options: SignalOptions<PathValue<T, P>> = {},
): SignalObject<PathValue<T, P>> {
  const { equals } = options
  const [track, trigger] = createSignal(undefined, { ...options, equals: false })
  const get = () => pathGet(data, path)
  const set = (value: any) => pathSet(data, path, value)

  const result = (() => {
    track()
    return get()
  }) as SignalObject<PathValue<T, P>>
  result.$ = (arg?) => {
    const _ = typeof arg === 'function' ? (arg as any)(get()) : arg
    const _equals = typeof equals === 'function'
      ? equals(get(), _)
      : equals === undefined
        ? get() === _
        : equals
    if (!_equals) {
      set(_)
      trigger()
    }
    return _
  }
  return result
}
