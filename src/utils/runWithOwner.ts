import { getOwner, runWithOwner } from 'solid-js'

export function $runWithOwner(cb: () => void) {
  const owner = getOwner()
  return () => runWithOwner(owner, cb)
}