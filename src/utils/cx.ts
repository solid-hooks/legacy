type MaybeArray<T> = T | T[]
type CxObject = Record<string, boolean | number | undefined | null | string>
export type CxArgs = MaybeArray<
  | string
  | string[]
  | number
  | boolean
  | CxObject
  | undefined
  | null
>[]
/**
 * util for generating classes
 * @example
 * ```tsx
 * <div class={$cx(
 *   'bg-rose-400 font-serif',
 *   'text-white',
 *   `hover:(
 *     bg-slate-400
 *     font-medium
 *   )`,
 *   count() === 2 && 'm-1',
 *   null,
 *   { 'enabled': true, 'disabled': false, 'm-1': 0, 'm-2': null },
 * )}/>
 * ```
 */
// eslint-disable-next-line antfu/top-level-function
export const $cx = (...args: CxArgs) => {
  let cx = ''
  for (const arg of args.flat(2)) {
    cx += !!arg && typeof arg !== 'boolean'
      ? `${typeof arg === 'object'
          ? Object.keys(arg).filter(k => !!arg[k]).join(' ')
          : `${arg}`} ` // join array
      : '' // skip falsy
  }
  return cx.trimEnd()
}
