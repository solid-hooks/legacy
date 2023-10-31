import { type Path, type PathValue, pathGet, pathSet } from 'object-standard-path'
import type { SignalOptions } from 'solid-js'
import { createSignal } from 'solid-js'
import type { AnyFunction } from '@subframe7536/type-utils'
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
  const { equals, ...rest } = options
  const [track, trigger] = createSignal(undefined, { ...rest, equals: false })
  const get = () => pathGet(data, path)

  const result = () => {
    track()
    return get()
  }

  const _equals = typeof equals === 'function'
    ? (result: any) => equals(get(), result)
    : equals === undefined
      ? (result: any) => get() === result
      : () => equals
  // @ts-expect-error assign
  result.$set = (arg?) => {
    const result = typeof arg === 'function'
      ? (arg as AnyFunction)(get())
      : arg
    if (!_equals(result)) {
      pathSet(data, path, result)
      trigger()
    }
    return result
  }
  return result as any
}
