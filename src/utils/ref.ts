import { type Path, type PathValue, pathGet, pathSet } from 'object-standard-path'
import type { SignalOptions } from 'solid-js'
import { createSignal } from 'solid-js'
import type { SignalObject } from '../signal'

/**
 * type of {@link $ref}
 */
export type RefObject<T> = SignalObject<T>
/**
 * `$()` like wrapper to make plain object props reactive
 * @param data source object
 * @param path object access path, support array access
 * @param options options
 */
export function $ref<T extends object, P extends Path<T>>(
  data: T,
  path: P,
  options: SignalOptions<PathValue<T, P>> = {},
): RefObject<PathValue<T, P>> {
  const { equals, internal, name } = options
  const [track, trigger] = createSignal(undefined, {
    equals: false,
    name: name ? `$ref-${name}[${path}]` : undefined,
    internal,
  })
  const get = () => pathGet(data, path)
  const set = (value: any) => pathSet(data, path, value)

  // eslint-disable-next-line solid/reactivity
  const result = (() => {
    track()
    return get()
  }) as RefObject<PathValue<T, P>>
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
