import type { SignalObject } from './signal'

/**
 * patch array signal
 * @param arr array signal
 * @param patcher patch data
 * @see https://github.com/subframe7536/solid-dollar#patchArray
 */
export function $patchArray<T extends any[]>(
  arr: SignalObject<T>,
  patcher: T | ((data: T) => void),
) {
  return arr.$set((_data) => {
    if (Array.isArray(patcher)) {
      return patcher
    }
    const _ = [..._data] as T
    patcher(_)
    return _
  })
}
