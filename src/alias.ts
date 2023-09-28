import { createComputed, createEffect, createRenderEffect, untrack } from 'solid-js'

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
export const $renderEffect = createRenderEffect
/**
 * run effect instantly
 *
 * alias for {@link createComputed}
 */
export const $instantEffect = createComputed
/**
 * prevent update notification and run
 *
 * alias for {@link untrack}
 */
export const $$ = untrack
