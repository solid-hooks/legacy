import {
  createEventListener,
  createEventListenerMap,
  makeEventListener,
} from '@solid-primitives/event-listener'

/**
 * listen event on `window`
 */
export const $listenWindow = makeEventListener.bind(null, window)

/**
 * listen event on `document`
 */
export const $listenDocument = makeEventListener.bind(null, document)

/**
 * listen reactive event on reactive `EventTarget`
 *
 * alias for {@link createEventListener}
 */
export const $listenEvent = createEventListener

/**
 * listen events map on reactive `EventTarget`
 *
 * alias for {@link createEventListenerMap}
 */
export const $listenEventMap = createEventListenerMap
