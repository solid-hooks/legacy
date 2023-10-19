import type { AnyFunction } from '@subframe7536/type-utils'
import type { Owner } from 'solid-js'
import { getOwner, runWithOwner } from 'solid-js'

/**
 * create callbacks with `runWithOwner`, auto get current owner
 * @param callback callback function
 * @param owner owner that run with
 * @see https://github.com/subframe7536/solid-dollar#callback
 */
export function $callback<T extends AnyFunction>(
  callback: T,
  owner: Owner | null = getOwner(),
): T {
  return owner
    ? (((...args) => runWithOwner(owner, () => callback(...args))) as T)
    : callback
}