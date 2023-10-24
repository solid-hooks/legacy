import { type Path, type PathValue, pathGet, pathSet } from 'object-standard-path'
import type { SignalOptions } from 'solid-js'
import { createSignal } from 'solid-js'
import type { SignalObject } from './signal'

/**
 * `$()` like wrapper to make plain object props reactive
 * @param data source object
 * @param path object access path, support array access
 * @param options signal options
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

  const result = () => {
    track()
    return get()
  }
  // @ts-expect-error assign
  result.$set = (arg?) => {
    const _ = typeof arg === 'function' ? (arg as any)(get()) : arg
    const _equals = typeof equals === 'function'
      ? equals(get(), _)
      : equals === undefined
        ? get() === _
        : equals
    if (!_equals) {
      pathSet(data, path, _)
      trigger()
    }
    return _
  }
  return result as any
}
