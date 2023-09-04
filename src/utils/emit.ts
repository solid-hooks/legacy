type FilterKeys<T> = keyof T extends `$${infer EventName}`
  ? EventName
  : never
type ParseKey<T> = T extends Record<string, any> ? {
  [K in keyof T as `$${K & string}`]: T[K]
} : never

type ParseArray<T, P = [T]> = T extends any[]
  ? T['length'] extends 1
    ? T[0] extends null | undefined
      ? []
      : [data: T[0]]
    : T['length'] extends 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
      ? T
      : [data: T] // ParseArray<string[]> => [data: string[]]
  : T extends number | bigint | string | symbol | boolean | object
    ? ParseArray<P>
    : []

type ParseFunction<P> = P extends Function
  ? P
  : (...args: ParseArray<P>) => void

export type EmitFunctions<E extends Record<string, any>> = ParseKey<{
  [K in keyof E]: ParseFunction<E[K]>
}>

export function $emit<
  E extends Record<string, any>,
  EventsMap = EmitFunctions<E>,
>(properties: EventsMap) {
  return <K extends FilterKeys<EventsMap>>(
    e: K,
    ...args: ParseArray<Required<E>[K]>
  ): void => {
    // @ts-expect-error access $... and call it
    properties[`$${e}`]?.(...args)
  }
}