import type { Owner } from 'solid-js'
import { getOwner, runWithOwner } from 'solid-js'

/**
 * wrapper for {@link runWithOwner} + {@link getOwner}
 * @example
 * ```ts
 * const run = $runWithOwn(() => {
 *   const foo = useContext(FooContext)
 *   createEffect(() => {
 *     console.log(foo)
 *   })
 * })
 * setTimeout(run, 1000)
 * ```
 */
export function $runWithOwner(fn: () => void, owner = getOwner()) {
  return (customOwner?: Owner) => runWithOwner(customOwner ?? owner, fn)
}