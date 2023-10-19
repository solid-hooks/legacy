import { $, $watch } from '../../src'
import type { EmitProps } from '../../src/utils'
import { $reactive, defineContext, defineEmits } from '../../src/utils'

const { useTestContext, TestProvider } = defineContext('test', (_props?: { test: number }) => new Date())
type Emits = {
  var: number
  update: [d1: string, d2?: string, d3?: string]
  optional?: { test: number }
}
const FOO = {
  bar: 1,
}
function Child(props: EmitProps<Emits, { num: number }>) {
  const { emit, $emit } = defineEmits<Emits>(props)
  const v = $emit('var', 1)
  const handleClick = () => {
    v.$set(v() + 1)
    emit('update', `emit from child: ${props.num}`, '[second param]')
    emit('optional', { test: 1 })
  }
  console.log('$ctx:', useTestContext())
  return (
    <div>
      child: {props.num}
      <button onClick={handleClick}>+</button>
    </div>
  )
}

export default function Basic() {
  const count = $(1)
  const refObj = $reactive(FOO, 'bar')
  $watch(count, (currentCount, oldCount) => {
    console.log('watch current value:', currentCount)
    console.log('watch old value:', oldCount)
    console.log('object ref:', refObj())
  })
  return (
    <TestProvider>
      <button
        onClick={() => (count.$set(c => c + 1), refObj.$set(data => data * 2))}
      >
        increase
      </button>
      <br />
      object ref: {refObj()}
      <div>{count()}</div>
      <Child
        num={count()}
        $update={console.log}
        $var={e => console.log('emit on $var:', e)}
      />
    </TestProvider>
  )
}
