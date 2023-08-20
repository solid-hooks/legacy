import { createRenderEffect, onCleanup } from 'solid-js'
import type { SignalObject } from './signal'

export type ModelParam = [
  signal: SignalObject<any>,
  config?: {
    event?: string
    value?: string
  },
]

export type ModelElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

/**
 * type support for $model
 *
 * @example
 * ```ts
 * import type { ModelDirective } from "solid-dollar";
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

export function $model(el: ModelElement, value: () => ModelParam) {
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
  property = config?.value ?? property

  // @ts-expect-error set value
  createRenderEffect(() => (el[property] = val()))
  const handleValue = (e: Event) => {
    // @ts-expect-error set value
    val.$set(e.target[property])
  }
  el.addEventListener(eventName, handleValue)
  onCleanup(() => el.removeEventListener(eventName, handleValue))
}
