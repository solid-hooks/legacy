import {
  makeEventListener,
} from '@solid-primitives/event-listener'

// more alias export at ./index.ts

/**
 * listen event on `window`, auto cleanup
 *
 * return cleanup function
 */
export const useWindowListener = makeEventListener.bind(makeEventListener, window)

/**
 * listen event on `document`, auto cleanup
 *
 * return cleanup function
 */
export const useDocumentListener = makeEventListener.bind(makeEventListener, document)
