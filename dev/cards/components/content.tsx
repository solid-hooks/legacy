import { pathGet } from 'object-standard-path'
import { useCustomState, useInfoState } from '../../state'

export default function Content() {
  const info = useInfoState()
  const plain = useCustomState()
  const start = new Date().getTime()
  const { pause, resume, isWatching } = info.$subscribe(state => console.log('watching info:', state))
  info.$subscribe(state => console.log('deep path data:', state), { path: 'deep.data' })
  async function handleClick() {
    const v = (new Date().getTime() - start) / 1000
    info.$.setTest(v)
    plain.$(v)
    info.$.sleepAndPlus(500)
    info.$patch({ deep: { data: `update at ${Date.now()}` } })
  }
  return (
    <>
      <div>
        source: {info().test}
      </div>
      <div>
        deep data: {pathGet(info(), 'deep.data')}
      </div>
      <div>{`is watching: ${isWatching()}`}</div>
      <button onClick={handleClick}>sync</button>
      <button onClick={pause}>pause</button>
      <button onClick={resume}>resume</button>
    </>
  )
}
