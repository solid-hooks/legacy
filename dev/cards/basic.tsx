import { $, $watch, noReturn } from '../../src'
import type { EmitFunctions } from '../../src/utils'
import { $cx, $emit } from '../../src/utils'

type Emits = {
  update: [d1: string, d2?: string, d3?: string]
  optional?: { test: number }
}

function Child(props: { num: number } & EmitFunctions<Emits>) {
  const emit = $emit<Emits>(props)
  const handleClick = () => {
    emit('update', `emit from child: ${props.num}`, 'second')
    emit('optional', { test: 1 })
  }
  return (<div>
    child:
    {props.num}
    <button onClick={handleClick}>+</button>
  </div>)
}

export default function Basic() {
  const count = $<number>(1, {
    preSet: v => noReturn(() => console.log(v)),
    postSet: console.log,
  })
  $watch(count, (currentCount, oldCount) => {
    console.log('watch current value:', currentCount)
    console.log('watch old value:', oldCount)
  }, { defer: true })
  return (
    <>
      <button
        class={$cx(
          'bg-rose-300 text-white',
          { 'hover:bg-slate-300': true },
          count() === 2 && 'm-1',
        )}
        onClick={() => count.$set(c => c + 1)}
      >
        increase
      </button>
      <div>{count()}</div>
      <Child num={count()} $update={console.log} />
    </>
  )
}
