import { createComputed, createDeferred, createEffect, createRenderEffect, untrack } from 'solid-js'

/**
 * normal effect
 *
 * alias for {@link createEffect}
 */
export const $effect = createEffect
/**
 * run effect after rendered, be able to access DOM
 *
 * alias for {@link createRenderEffect}
 */
export const $effectRendered = createRenderEffect
/**
 * run effect instantly
 *
 * alias for {@link createComputed}
 */
export const $effectInstant = createComputed
/**
 * prevent update notification and run
 *
 * alias for {@link untrack}
 */
export const $$ = untrack

/**
 * defer update notification until browser is idle
 *
 * alias for {@link createDeferred}
 */
export const $deferred = createDeferred
