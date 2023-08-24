import { useInfoState } from '../state'

export default function Content() {
  const info = useInfoState()
  return (
    <>
      <div>
        source:
        {info().test}
      </div>
      <button onClick={() => info.setTest(new Date().getTime())}>sync</button>
    </>
  )
}