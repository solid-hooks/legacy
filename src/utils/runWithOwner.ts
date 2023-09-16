import { getOwner, runWithOwner } from 'solid-js'

export function $runWithOwner(fn: () => void) {
  const owner = getOwner()
  return () => runWithOwner(owner, fn)
}