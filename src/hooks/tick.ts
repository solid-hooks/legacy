/**
 * vue-like next tick
 */
export function useTick<T = void>(this: T, fn?: (this: T) => void): Promise<void> {
  return Promise.resolve().then(this ? fn?.bind(this) : fn)
}
