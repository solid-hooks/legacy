import { createComputed, createSignal, getOwner, onCleanup, untrack } from 'solid-js'

/**
 * executes a callback using the {@link requestIdleCallback} API, fallback to {@link requestAnimationFrame}.
 * otherwise execute the callback directly, auto cleanup
 *
 * @param fn callback function.
 * @param options original IdleRequestOptions.
 */
export function $idleCallback(
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

    getOwner() && onCleanup(() => {
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
