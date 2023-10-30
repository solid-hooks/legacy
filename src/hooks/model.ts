import type { Accessor } from 'solid-js'
import { createRenderEffect } from 'solid-js'
import { makeEventListener } from '@solid-primitives/event-listener'
import type { SignalObject } from '../signal'

/**
 * type support for {@link model} directive
 */
export interface ModelDirective {
  model: SignalObject<any>
}

/**
 * two-way binding directive
 */
export function model(
  el: HTMLInputElement | HTMLSelectElement,
  data: Accessor<SignalObject<any>>,
) {
  const value = data()
  let eventName = 'input'
  let property = 'value'
  if (el instanceof HTMLInputElement && ['checkbox', 'radio'].includes(el.type)) {
    eventName = 'change'
    property = 'checked'
  } else if (el instanceof HTMLSelectElement) {
    eventName = 'change'
    property = 'value'
  }
  createRenderEffect(() => {
    (el as any)[property] = value()
  })
  makeEventListener(el, eventName, ({ target }) => {
    target && value.$set((target as any)[property])
  })
}
