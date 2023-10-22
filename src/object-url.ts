import type { $TRACK, SignalOptions } from 'solid-js'
import { createSignal } from 'solid-js'

type ObjectTypes = Blob | File | MediaSource | ArrayBuffer | string

/**
 * type of {@link $objectURL}
 */
export type ObjectURLObject = {
  (): string
  /**
   * setter function
   */
  $set: (data: ObjectTypes) => string
  /**
   * type only symbol
   */
  [$TRACK]: 'object-url(type only)'
}

/**
 * convert blob to URL
 * @param value initial value
 * @param options signal options
 * @see https://github.com/subframe7536/solid-dollar#objecturl
 */
export function $objectURL(
  value: Blob | File | MediaSource,
  options?: SignalOptions<string>
): ObjectURLObject
/**
 * convert ArrayBuffer or string to URL
 * @param value initial value
 * @param options signal options
 * @see https://github.com/subframe7536/solid-dollar#objecturl
 */
export function $objectURL(
  value: ArrayBuffer | string,
  options?: SignalOptions<string> & BlobPropertyBag
): ObjectURLObject
export function $objectURL(
  value: any,
  { endings, type, ...options }: SignalOptions<string> & BlobPropertyBag = {},
): ObjectURLObject {
  function generate(data: ObjectTypes) {
    return URL.createObjectURL(
      data instanceof ArrayBuffer || typeof data === 'string'
        ? new Blob([data], { endings, type })
        : data,
    )
  }

  const [url, setURL] = createSignal(generate(value), options)

  // @ts-expect-error assign
  url.$set = (data: ObjectTypes) => {
    URL.revokeObjectURL(url())
    setURL(generate(data))
  }

  return url as ObjectURLObject
}
