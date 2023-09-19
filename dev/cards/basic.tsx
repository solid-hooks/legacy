import { $, $watch, noReturn } from '../../src'
import type { EmitProps } from '../../src/utils'
import { $ctx, $cx, $emits, $noThrow } from '../../src/utils'

const { useTest, TestProvider } = $ctx('test', () => new Date())
type Emits = {
  var: number
  update: [d1: string, d2?: string, d3?: string]
  optional?: { test: number }
}

function Child(props: EmitProps<Emits, { num: number }>) {
  const { emit, useEmits } = $emits<Emits>(props)
  const v = useEmits('var', 1)
  const handleClick = () => {
    v.$set(v => v + 1)
    const e = $noThrow(() => {
      const v = Date.now()
      if (v % 2) {
        throw new Error('asd')
      } else {
        return v
      }
    })
    console.log(`is error: ${e instanceof Error}, value:`, e)
    emit('update', `emit from child: ${props.num}`, '[second param]')
    emit('optional', { test: 1 })
  }
  console.log('$ctx:', useTest())
  return (<div>
    child:
    {props.num}
    <button onClick={handleClick}>+</button>
  </div>)
}

export default function Basic() {
  const count = $<number>(1, {
    preSet: v => noReturn(() => console.log('pre set', v)),
    postSet: v => console.log('post set:', v),
  })
  $watch(count, (currentCount, oldCount) => {
    console.log('watch current value:', currentCount)
    console.log('watch old value:', oldCount)
  }, { defer: true })
  return (
    <TestProvider>
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
      <Child num={count()}
        $update={console.log}
        $var={e => console.log('useEmits:', e)}
      />
    </TestProvider>
  )
}
