import { $loadScript } from '../../src/utils'
import Input from './components/input'
import Content from './components/content'

export default function ShowGlobalState() {
  $loadScript('console.log(`test load script`)')
  return (
    <>
      <Content />
      <Input />
    </>
  )
}
