import { createRenderEffect, onCleanup } from 'solid-js'
import type { SignalObject } from './signal'

type ModalParam = [signal: SignalObject<any>, event?: string]

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      model: ModalParam
    }
  }
}

type ModalElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

// https://github.com/kajetansw/solar-forms/blob/master/src/core/form-group-directive/form-group-directive.tsx
export function createModel() {
  return { model }
}

export function model(el: ModalElement, value: () => ModalParam) {
  const [val, event] = value()
  let eventName = 'input'
  let property = 'value'
  if (el instanceof HTMLInputElement && ['checkbox', 'radio'].includes(el.type)) {
    eventName = 'change'
    property = 'checked'
  } else if (el instanceof HTMLSelectElement) {
    eventName = 'change'
    property = 'value'
  }
  eventName = event ?? eventName

  // @ts-expect-error set value
  createRenderEffect(() => (el[property] = val()))
  const handleValue = (e: Event) => {
    // @ts-expect-error set value
    val.set(e.target[property])
  }
  el.addEventListener(eventName, handleValue)
  onCleanup(() => el.removeEventListener(eventName, handleValue))
}
