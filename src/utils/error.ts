/**
 * type guard for {@link NormalizedError}
 */
export function isNormalizedError(e: unknown): e is NormalizedError {
  return e instanceof Error && 'val' in e && e.stack !== undefined
}

export class NormalizedError extends Error {
  val?: unknown

  /**
   * normalize unknown error in try-catch
   *
   * if input is not Error, `val` will be set
   */
  constructor(e: unknown) {
    if (e instanceof Error) {
      super(e.message)
      this.stack = e.stack
    } else {
      let msg
      try {
        msg = typeof e === 'string' ? e : JSON.stringify(e)
      } catch (ignore) {
        msg = 'non-serializable value'
      }
      super(msg)
      this.val = e
    }
  }
}

/**
 * convert unknown error to {@link NormalizedError}
 */
export function toNormalizedError(e: unknown): NormalizedError {
  return new NormalizedError(e)
}

type Promisable<T> = T | Promise<T>

/**
 * auto catch and normalize error
 *
 * @returns function return or {@link NormalizedError},
 */
export function $noThrow<T>(
  fn: () => T
): T | NormalizedError
export function $noThrow<T>(
  fn: () => Promise<T>,
): Promise<T | NormalizedError>
export function $noThrow<T>(
  fn: () => Promisable<T>,
): Promisable<T | NormalizedError> {
  try {
    const ret = fn()
    return ret instanceof Promise ? ret.catch(toNormalizedError) : ret
  } catch (e) {
    return toNormalizedError(e)
  }
}
