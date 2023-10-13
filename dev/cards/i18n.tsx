import { For } from 'solid-js'
import { useI18n } from '../i18n'
import { useInfoState } from '../state'

export default function ShowI18n() {
  const info = useInfoState()
  const { $t, $d, $n, availiableLocales, locale } = useI18n()
  const { $t: t } = useI18n('nest')
  function changeLocale(target: string) {
    locale.$(target)
  }
  return (
    <>
      <select onChange={e => changeLocale(e.target.value)}>
        <For each={availiableLocales}>
          {l => <option selected={l === locale()}>{l}</option>}
        </For>
      </select>
      <div>{$t('test')}</div>
      <br />
      <div>{t('description')}:</div>
      <div>{$t('nest.description')}:</div>
      <div>{$t('plural', { name: 'test', num: ~~(info().test % 8) })}</div>
      <br />
      Date:
      <div>{$d(new Date(), 'custom')}</div>
      <div>{$d(new Date(), 'long')}</div>
      <div>{$d(new Date(), 'long', 'en')}</div>
      <div>{$n(100, 'currency')}</div>
    </>
  )
}
