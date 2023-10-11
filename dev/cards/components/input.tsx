import { For } from 'solid-js'
import { useInfoState } from '../../state'
import { $, $selector } from '../../../src'

export default function Input() {
  const info = useInfoState()
  const selectedId = $selector(0)
  const list = $([{ id: 0, name: '0' }])

  return (
    <>
      <For each={list()}>
        {item => <li classList={{ active: selectedId.$bind(item.id) }}>{item.name}</li>}
      </For>

      <div>
        double:
        <span>{info.doubleValue()}</span>
      </div>
      <div>
        test memo:
        <span>{info.doubleValue()}</span>
      </div>
    </>
  )
}
