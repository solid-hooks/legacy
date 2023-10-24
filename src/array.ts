import type { SignalObject } from './signal'

export function $patchArray<T extends any[]>(arr: SignalObject<T>, fn: (data: T) => void) {
  return arr.$set((data) => {
    const _ = [...data] as T
    fn(_)
    return _
  })
}
