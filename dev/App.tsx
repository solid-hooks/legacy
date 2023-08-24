import { type Component, For } from 'solid-js'
import { $, $cx, $model, $watch } from '../src'
import { useI18n } from './i18n'

const App: Component = () => {
  const count = $(1)
  const val = $('test1')
  const { $t, $d, $n, availiableLocales, locale } = useI18n()

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
      <select onChange={e => changeLocale(e.target.value)}>
        <For each={availiableLocales}>
          {l => <option selected={l === locale()}>{l}</option>}
        </For>
      </select>
      <button
        class={$cx(
          'bg-rose-300 text-black',
          { 'hover:bg-slate-300': true },
          count() === 2 && 'm-1',
        )}
        onClick={() => count.$set(c => c + 1)}
      >
        increase
      </button>
      <div>{count()}</div>
      <div>{$t('test')}</div>
      <div>{$t('plural', { name: val(), num: count() })}</div>
      <div>{$d(new Date())}</div>
      <div>{$d(new Date(), 'short')}</div>
      <div>{$d(new Date(), 'long', 'en')}</div>
      <div>{$n(100, 'currency')}</div>
    </>
  )
}

export default App
