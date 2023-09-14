function isError(e: unknown): e is Error {
  return !!e && Object.prototype.toString.call(e) === '[object Error]'
}
export function isPromise(result: unknown): result is Promise<unknown> {
  return !!result
  && typeof result === 'object'
  && 'then' in result
  && typeof result.then === 'function'
  && 'catch' in result
  && typeof result.catch === 'function'
}

/**
 * type guard for {@link NormalizedError}
 */
export function isNormalizedError(e: unknown): e is NormalizedError {
  return isError(e) && 'val' in e && e.stack !== undefined
}

export class NormalizedError extends Error {
  val?: unknown

  /**
   * normalize unknown error in try-catch
   *
   * if input is not Error, `val` will be set
   */
  constructor(e: unknown) {
    if (isError(e)) {
      super(e.message)
      this.stack = e.stack
    } else {
      let msg
      try {
        msg = typeof e === 'string' ? e : JSON.stringify(e)
      } catch (ignore) {
        msg = 'non-stringifiable object'
      }
      super(`Unexpected data ${msg}`)
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
    return isPromise(ret) ? ret.catch(toNormalizedError) : ret
  } catch (e) {
    return toNormalizedError(e)
  }
}
