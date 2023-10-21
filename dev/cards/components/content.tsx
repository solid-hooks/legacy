import { pathGet } from 'object-standard-path'
import { useCustomState, useInfoState } from '../../state'
import { useActions } from '../../../src/state/utils'

export default function Content() {
  const info = useInfoState()
  const { plain } = useCustomState()
  const start = new Date().getTime()
  const { pause, resume, isWatching } = info.$subscribe(state => console.log('watching info:', state))
  info.$subscribe(state => state.deep.data, state => console.log('deep path data:', state))
  async function handleClick() {
    const v = (new Date().getTime() - start) / 1000
    const { setTest, sleepAndPlus } = useActions(info)
    setTest(v)
    plain.$set(v)
    sleepAndPlus(500)
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
