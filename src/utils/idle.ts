import { createComputed, createSignal, onCleanup, untrack } from 'solid-js'

/**
 * executes a callback using the `requestIdleCallback` API, fallback to `requestAnimationFrame`.
 * otherwise execute the callback directly, auto cleanup
 *
 * @param fn callback function.
 * @param options original IdleRequestOptions.
 */
export function $idle(
  fn: () => void,
  options?: IdleRequestOptions,
): void {
  const [handle, setHandle] = createSignal<number>()
  const canUseIdleCallback = 'requestIdleCallback' in window
  const canUseAnimationFrame = 'requestAnimationFrame' in window

  createComputed(() => {
    if (canUseIdleCallback) {
      untrack(() => setHandle(window.requestIdleCallback(fn, options)))
    } else if (canUseAnimationFrame) {
      untrack(() => setHandle((window as Window).requestAnimationFrame(fn)))
    } else {
      fn()
    }

    onCleanup(() => {
      const currentHandle = handle()

      if (currentHandle == null) {
        return
      }

      if ('cancelIdleCallback' in window) {
        window.cancelIdleCallback(currentHandle)
      } else if ('cancelAnimationFrame' in window) {
        (window as Window).cancelAnimationFrame(currentHandle)
      }
    })
  })
}
