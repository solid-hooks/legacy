import { $idb } from '../../src/utils'

const { useIDB, clearAll } = $idb({ name: 'test' })

export default function ShowIDB() {
  const time = useIDB<number>('time')
  const extra = useIDB<string>('extra')
  const cb = () => {
    time.$(new Date().getTime())
  }
  const cbExtra = () => {
    extra.$('extra')
  }
  return (
    <>
      <div>{time()}</div>
      <div>{extra()}</div>
      <button onClick={cb}>update time</button>
      <button onClick={cbExtra}>update extra</button>
      <br />
      <button onClick={() => time.$del()}>del time</button>
      <button onClick={() => extra.$del()}>del extra</button>
      <br />
      <button onClick={clearAll}>clear all</button>
    </>
  )
}