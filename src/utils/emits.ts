import type { ParseFunction, ParseParameters, StringKeys } from '@subframe7536/type-utils'
import { type SignalOptions, createEffect, createSignal, on } from 'solid-js'
import type { SignalObject } from '../signal'

type FilterKeys<T> = keyof T extends `$${infer EventName}`
  ? EventName
  : never
type ParseKey<T extends Record<string, any>> = {
  [K in keyof T as `$${K & string}`]: T[K]
}
type FilterOneParameterEvents<
  Events extends Record<string, any>,
  EventKeys extends string = StringKeys<Events>,
> = {
  [K in EventKeys]: ParseParameters<Required<Events>[K]>['length'] extends 1 ? K : never
}[EventKeys]
/**
 * utility type for function emitting
 */
export type EmitProps<
  Events extends Record<string, any>,
  Props extends Record<string, any> = {},
> = Props & ParseKey<{
  [K in keyof Events]: ParseFunction<Events[K]>
}>

/**
 * type for {@link $emits}
 */
export type EmitsObject<PropsWithFn, Events extends Record<string, any>> = {
  /**
   * trigger event
   * @param event trigger event
   * @param ...data event data
   */
  emit: <K extends FilterKeys<PropsWithFn>>(
    event: K,
    ...data: ParseParameters<Required<Events>[K]>
  ) => void
  /**
   * create a {@link SignalObject} that trigger event after value is set
   * @param event trigger event (only events with one parameter allowed)
   * @param value initial value
   * @param options optoins
   */
  useEmits: <
    K extends FilterOneParameterEvents<Events, FilterKeys<PropsWithFn>>,
    V = ParseParameters<Required<Events>[K]>[0],
  >(
    event: K,
    value: V,
    options?: SignalOptions<V>
  ) => SignalObject<V>
}

/**
 * util for child component event emitting, auto handle optional prop
 * @param props conponents props
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
  Events extends Record<string, any>,
  PropsWithEmitFn = EmitProps<Events>,
>(props: PropsWithEmitFn): EmitsObject<PropsWithEmitFn, Events> {
  return {
    emit: (e, ...args) => {
      // @ts-expect-error access $... and call it
      props[`$${e}`]?.(...args)
    },
    useEmits: (e, value, options) => {
      const [val, setVal] = createSignal(value, {
        name: `$emits-${e}`,
        ...options,
      })
      createEffect(on(val, (value) => {
        // @ts-expect-error emit
        props[`$${e}`]?.(value)
      }, { defer: true }))
      // @ts-expect-error assign
      val.$ = setVal
      return val as any
    },
  }
}