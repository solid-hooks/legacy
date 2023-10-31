import { For, observable, onMount } from 'solid-js'
import { $, $effect, $effectInstant, $effectRendered, $patchArray } from '../../src'
import { useTick } from '../../src/hooks'

export function TestSeq() {
  const str = $('before all')
  const logList = $<string[]>([])
  const log = (str: string) => $patchArray(logList, (arr) => {
    arr.push(str)
  })
  log(str())
  queueMicrotask(() => {
    log(`micro task: ${str()}`)
    str.$set('set when micro task')
  })
  $effect(() => log(`effect: ${str()}`))
  $effectRendered(() => log(`rendered: ${str()}`))
  $effectInstant(() => log(`instant: ${str()}`))
  // same with $effect
  observable(str).subscribe({
    next(str) {
      log(`subscribe: ${str}`)
    },
  })
  // same with queueMicroTask
  useTick(() => {
    log(`tick: ${str()}`)
    str.$set('set when promise')
  })
  onMount(() => {
    log(`mount: ${str()}`)
    str.$set('change onMount')
    log(`mount: ${str()}`)
  })
  str.$set('normal set')
  log('after all')
  return (
    <div style={{ overflow: 'scroll', height: '80%' }}>
      <For each={logList()}>
        {item => <div>{item}</div>}
      </For>
    </div>
  )
}
