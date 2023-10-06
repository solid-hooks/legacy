import { createRenderEffect, onCleanup } from 'solid-js'
import type { SignalObject } from '../signal'

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
  $model: SignalObject<any>
}

export function $model(el: HTMLElement, value: () => SignalObject<any>) {
  const data = value()

  let eventName = 'input'
  let property = 'value'
  if (el instanceof HTMLInputElement && ['checkbox', 'radio'].includes(el.type)) {
    eventName = 'change'
    property = 'checked'
  } else if (el instanceof HTMLSelectElement) {
    eventName = 'change'
    property = 'value'
  }
  createRenderEffect(() => ((el as any)[property] = data()))
  const handleValue = ({ target }: Event) => {
    target && data.$((target as any)[property])
  }
  el.addEventListener(eventName, handleValue)
  onCleanup(() => el.removeEventListener(eventName, handleValue))
}
