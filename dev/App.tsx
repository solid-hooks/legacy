import { type Component, For } from 'solid-js'
import { $, $cx, $model, $watch } from '../src'
import { useI18n } from './i18n'

const App: Component = () => {
  const count = $(1)
  const val = $('test1')
  const { $t, availiableLocales, locale } = useI18n()

  $watch(count, () => {
    console.log(count() + 1)
  }, { defer: true })

  function changeLocale(target: string) {
    locale.$set(target)
  }
  // eslint-disable-next-line no-unused-expressions
  $model
  return (
    <>
      <input type="text" use:$model={[val]} />
      {val()}
      <div>{count()}</div>
      <div>{$t('test')}</div>
      <select onChange={e => changeLocale(e.target.value)}>
        <For each={availiableLocales}>
          {l => <option selected={l === locale()}>{l}</option>}
        </For>
      </select>
      <button
        class={$cx(
          'bg-rose-400',
          { 'hover:bg-slate-400': true },
          count() === 2 && 'm-1',
        )}
        onClick={() => count.$set(c => c + 1)}
      >
        increase
      </button>
    </>
  )
}

export default App
