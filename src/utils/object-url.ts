import type { SignalOptions } from 'solid-js'
import { createSignal } from 'solid-js'

type ObjectTypes = Blob | File | MediaSource | ArrayBuffer | string

/**
 * type of {@link $objectURL}
 */
export type ObjectURLObject = {
  (): string
  $set: (data: ObjectTypes) => string
}

/**
 * convert blob to URL
 * @param value blobs
 * @param options options
 */
export function $objectURL(
  value: Blob | File | MediaSource,
  options?: SignalOptions<string>
): ObjectURLObject
/**
 * convert ArrayBuffer or string to URL
 * @param value ArrayBuffer or string
 * @param options options
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
