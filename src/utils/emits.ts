import type { SignalObject, SignalObjectOptions } from '../signal'
import { $ } from '../signal'

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

/**
 * utility type for function emitting
 */
export type EmitProps<
  E extends Record<string, any>,
  P extends Record<string, any> = {},
> = ParseKey<{
  [K in keyof E]: ParseFunction<E[K]>
}> & P

/**
 * type for {@link $emits}
 */
export type EmitsObject<EventsMap, E extends Record<string, any>> = {
  /**
   * trigger event
   */
  emit: <K extends FilterKeys<EventsMap>>(
    event: K,
    ...args: ParseArray<Required<E>[K]>
  ) => void
  /**
   * return a {@link SignalObject} that trigger event after value is set
   */
  useEmits: <K extends FilterKeys<EventsMap>, V = ParseArray<Required<E>[K]>>(
    event: K,
    value: V,
    options?: Omit<SignalObjectOptions<V>, 'defer'>
  ) => SignalObject<V>
}

/**
 * util for child component event emitting, auto handle optional prop
 * @param properties conponents props
 * @example
 * ```tsx
 * type Emits = {
 *   var: number
 *   update: [d1: string, d2?: string, d3?: string]
 *   optional?: { test: number }
 * }
 *
 * function Child(props: EmitProps<Emits, { num: number }>) {
 *   const { emit, useEmits } = $emits<Emits>(props)
 *   const var = useEmits('var', 1)
 *   const handleClick = () => {
 *     var.$(v => v + 1)
 *     emit('update', `emit from child: ${props.num}`, 'second')
 *     emit('optional', { test: 1 })
 *   }
 *   return (<div>
 *     child:
 *     {props.num}
 *     <button onClick={handleClick}>+</button>
 *   </div>)
 * }
 * function Father() {
 *   const count = $('init')
 *   return <Child num={count()}
 *     $update={console.log}
 *     $var={e => console.log('useEmits:', e)}
 *   />
 * }
 * ```
 */
export function $emits<
  E extends Record<string, any>,
  EventsMap = EmitProps<E>,
>(properties: EventsMap): EmitsObject<EventsMap, E> {
  return {
    emit: (e, ...args) => {
      // @ts-expect-error access $... and call it
      properties[`$${e}`]?.(...args)
    },
    useEmits: (e, value, { postSet, ...options } = {}) => $(value, {
      name: `$emits-${e}`,
      ...options,
      postSet(newValue) {
        // @ts-expect-error emit
        properties[`$${e}`]?.(newValue)
        postSet?.(newValue)
      },
      defer: true,
    }),
  }
}