import { $ } from '../../src'
import { $model } from '../../src/utils'

export default function ShowDirective() {
  const val = $('test1')
  // eslint-disable-next-line no-unused-expressions
  $model
  return (
    <>
      <input type="text" use:$model={val} />
      <br />
      test: {val()}
    </>
  )
}
