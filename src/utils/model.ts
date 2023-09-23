import { createRenderEffect, onCleanup } from 'solid-js'
import type { SignalObject } from '../signal'

export type ModelParam = [
  /**
   * binded signal
   */
  signal: SignalObject<any>,
  config?: {
    /**
     * trigger event
     */
    event?: keyof HTMLElementEventMap & string
    /**
     * event target property
     */
    property?: string
    /**
     * update signal with event target property
     * @param eventTargetPropertyValue `event.target[property]`
     * @returns signal value
     */
    updateSignal?: (eventTargetPropertyValue: any) => any
    /**
     * update element property with signal
     * @param signalValue `signal()`
     * @returns el[property] value
     */
    updateProperty?: (signalValue: any) => any
  },
]

/**
 * type support for $model
 *
 * @example
 * ```ts
 * import type { ModelDirective } from "solid-dollar/utils";
 * declare module 'solid-js' {
 *   namespace JSX {
 *     interface Directives extends ModelDirective {}
 *   }
 * }
 * export { }
 * ```
 */
export interface ModelDirective {
  $model: ModelParam
}

export function $model(el: HTMLElement, value: () => ModelParam) {
  const [val, config] = value()
  let eventName = 'input'
  let property = 'value'
  if (el instanceof HTMLInputElement && ['checkbox', 'radio'].includes(el.type)) {
    eventName = 'change'
    property = 'checked'
  } else if (el instanceof HTMLSelectElement) {
    eventName = 'change'
    property = 'value'
  }
  eventName = config?.event ?? eventName
  property = config?.property ?? property
  const fnProperty = config?.updateProperty || (v => v)
  const fnSignal = config?.updateSignal || (v => v)

  // @ts-expect-error set value
  createRenderEffect(() => (el[property] = fnSignal(val())))
  const handleValue = (event: Event) => {
    // @ts-expect-error set value
    val.$(fnProperty(event.target[property]))
  }
  el.addEventListener(eventName, handleValue)
  onCleanup(() => el.removeEventListener(eventName, handleValue))
}
