import { useInfoState } from '../state'

export default function Input() {
  const info = useInfoState()
  return (
    <div>
      {'double:'}
      <input type="text" value={info.doubleValue()} />
    </div>
  )
}