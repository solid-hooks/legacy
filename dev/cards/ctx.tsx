import { $ctx } from '../../src'

const useCtx = $ctx({ id: 1 })

function X() {
  const state = useCtx()!
  return (<div>
    X:
    {state().id}
  </div>)
}
function Y() {
  const state = useCtx()!
  return <button onClick={() => state.$set('id', i => i + 1)}>+</button>
}
export default function ShowContext() {
  console.log('state outside context:', useCtx())
  return (
    <useCtx.$Provider>
      <X />
      <Y />
    </useCtx.$Provider>
  )
}