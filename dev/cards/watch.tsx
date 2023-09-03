import { $, $watch, noReturn } from '../../src'
import { $cx } from '../../src/utils'

export default function ShowSignalAndWatch() {
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
    </>
  )
}
