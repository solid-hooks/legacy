import { catchError } from 'solid-js'

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

/**
 * auto catch and normalize error
 */
export function noThrow<T>(
  fn: () => T
): T | NormalizedError
export function noThrow<T>(
  fn: () => Promise<T>,
): Promise<T | NormalizedError>
export function noThrow(
  fn: () => any,
): any {
  try {
    const ret = fn()
    return ret instanceof Promise ? ret.catch(toNormalizedError) : ret
  } catch (e) {
    return toNormalizedError(e)
  }
}

/**
 * wrapper for {@link catchError}, handle {@link NormalizedError}
 */
export function $catchError<T>(
  fn: () => T,
  handler: (err: NormalizedError) => void,
): T | undefined {
  return catchError(fn, e => handler(toNormalizedError(e)))
}
