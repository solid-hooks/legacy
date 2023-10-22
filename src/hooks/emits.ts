import type { ParseFunction, ParseParameters, StringKeys } from '@subframe7536/type-utils'
import { type SignalOptions, createEffect, on } from 'solid-js'
import { $, type SignalObject } from '../signal'

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
 * type for {@link useEmits}
 */
export type EmitsObject<PropsWithEmits, Emits extends Record<string, any>> = {
  /**
   * trigger event
   * @param event trigger event
   * @param ...data event data
   */
  emit: <K extends FilterKeys<PropsWithEmits>>(
    event: K,
    ...data: ParseParameters<Required<Emits>[K]>
  ) => void
  /**
   * create a {@link SignalObject} that trigger event after value is set
   * @param event trigger event (only events with one parameter allowed)
   * @param value initial value
   * @param options options
   */
  $emit: <
    K extends FilterOneParameterEvents<Emits, FilterKeys<PropsWithEmits>>,
    V = ParseParameters<Required<Emits>[K]>[0],
  >(
    event: K,
    value: V,
    options?: SignalOptions<V>
  ) => SignalObject<V>
}

/**
 * util for child component event emitting, auto handle optional prop
 * @param props conponents props
 * @see https://github.com/subframe7536/solid-dollar#useEmits
 */
export function useEmits<
  Emits extends Record<string, any>,
  PropsWithEmits = EmitProps<Emits>,
>(props: PropsWithEmits): EmitsObject<PropsWithEmits, Emits> {
  return {
    emit: (e, ...args) => {
      // @ts-expect-error emit
      props[`$${e}`]?.(...args)
    },
    $emit: (e, value, options) => {
      const val = $(value, options)
      createEffect(on(val, (value) => {
        // @ts-expect-error emit
        props[`$${e}`]?.(value)
      }, { defer: true }))
      return val
    },
  }
}
