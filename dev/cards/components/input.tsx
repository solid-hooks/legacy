import { useInfoState } from '../../state'

export default function Input() {
  const info = useInfoState()
  return (
    <>
      <div>
        double:
        <span>{info.doubleValue()}</span>
      </div>
      <div>
        test memo:
        <span>{info.doubleValue()}</span>
      </div>
    </>
  )
}