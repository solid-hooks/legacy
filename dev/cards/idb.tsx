import { $idb, $idbRecord } from '../../src/utils'

export default function ShowIDB() {
  const time = $idb<number>('time')
  const extra = $idb<string>('extra')
  const record = $idbRecord<string, Date>('record1')
  record.$('a', new Date('2000-01-01'))
  record.$('b', new Date())

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
      <div>record: {record()?.toLocaleString()}</div>
      <button onClick={cb}>update time</button>
      <button onClick={cbExtra}>update extra</button>
      <br />
      <button onClick={() => time.$del()}>del time</button>
      <button onClick={() => extra.$del()}>del extra</button>
      <br />
      <button
        onClick={() => record.$(record.$() === 'a' ? 'b' : 'a')}
      >
        toggle record
      </button>
    </>
  )
}
