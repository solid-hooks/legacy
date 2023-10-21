import { useScriptLoader } from '../../src/hooks'
import Input from './components/input'
import Content from './components/content'

export default function ShowGlobalState() {
  useScriptLoader('console.log(`test load script`)')
  return (
    <>
      <Content />
      <Input />
    </>
  )
}
