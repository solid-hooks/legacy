import { useInfoState } from '../../state'

export default function Content() {
  const info = useInfoState()
  const start = new Date().getTime()
  return (
    <>
      <div>
        source:
        {info().test}
      </div>
      <button onClick={() => info.setTest((new Date().getTime() - start) / 1000)}>sync</button>
    </>
  )
}