import { For, onMount } from 'solid-js'
import { $, $effect, $effectInstant, $effectRendered } from '../../src'
import { $array, $tick } from '../../src/utils'

export function TestSeq() {
  const num = $(1)
  const logList = $array<string[]>([])

  const log = (str: string) => logList.$update((arr) => {
    arr.push(str)
  })
  log('before all')
  $effect(() => log(`effect: ${num()}`))
  $effectRendered(() => log(`rendered: ${num()}`))
  $effectInstant(() => log(`instant: ${num()}`))
  $tick(() => log(`tick: ${num()}`))
  queueMicrotask(() => log(`micro queue: ${num()}`))
  onMount(() => {
    log(`mount: ${num()}`)
    num.$set(3)
    log(`mount: ${num()}`)
  })
  num.$set(2)
  log('after all')
  return (
    <For each={logList()}>
      {item => <div>{item}</div>}
    </For>
  )
}
