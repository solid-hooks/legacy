function isError(value: unknown): value is Error {
  return !!value && Object.prototype.toString.call(value) === '[object Error]'
}

export function isNormalizedError(value: unknown): value is NormalizedError {
  return isError(value)
    && 'val' in value
    && value.stack !== undefined
}

export class NormalizedError extends Error {
  val?: unknown

  /**
   * Initializes a new instance of the `NormalizedError` class.
   *
   * @param error An `Error` object.
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
      Error.captureStackTrace(this, NormalizedError)
      this.val = e
    }
  }
}

export function toNormalizedError(e: unknown): NormalizedError {
  return new NormalizedError(e)
}

export async function noThrow<T>(action: () => Promise<T>): Promise<NormalizedError | T> {
  return action().catch(toNormalizedError)
}
