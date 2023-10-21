import { beforeEach, describe, expect, it } from 'vitest'
import { $i18n } from '../src/i18n'
import { useTick } from '../src/hooks'

describe('i18n', () => {
  const en = {
    text: 'text',
    var: 'welcome {name}, last login: {num}(1=one day|2-4,6=a few days|*=$ days) ago',
    nest: {
      text: 'nest {value}',
    },
    useless: 'useless',
  } as const
  const zh = {
    text: '文本',
    var: '欢迎 {name}, 上次登录: {num} 天前',
    nest: {
      text: '嵌套 {value}',
    },
  } as const
  const useI18n = $i18n({
    message: { en, zh },
    defaultLocale: 'en',
    numberFormats: {
      en: {
        currency: { style: 'currency', currency: 'USD' },
      },
      zh: {
        currency: { style: 'currency', currency: 'CNY' },
      },
    },
    datetimeFormats: {
      en: {
        short: { dateStyle: 'short' },
        long: { dateStyle: 'long' },
        custom: d => d.getTime().toString(),
      },
      zh: {
        short: { dateStyle: 'short' },
        long: { dateStyle: 'long' },
        custom: d => d.getTime().toString(),
      },
    },
  })
  const { availiableLocales, locale, $t, $d, $n } = useI18n()
  const { $t: $scopeTranslate } = useI18n('nest')
  beforeEach(() => {
    locale.$set('en')
  })

  async function changeLocale() {
    locale.$set('zh')
    await useTick()
  }

  it('translation', async () => {
    expect(availiableLocales).toStrictEqual(['en', 'zh'])
    expect($t('text')).toBe('text')
    expect($scopeTranslate('text', { value: 1 })).toBe('nest 1')

    await changeLocale()

    expect($t('text')).toBe('文本')
    expect($t('nest.text', { value: 1 })).toBe('嵌套 1')
  })
  it('variable', async () => {
    expect($t('var', { name: 'test', num: 1 })).toBe('welcome test, last login: one day ago')
    expect($t('var', { name: 'test', num: 2 })).toBe('welcome test, last login: a few days ago')
    expect($t('var', { name: 'test', num: 3 })).toBe('welcome test, last login: a few days ago')
    expect($t('var', { name: 'test', num: 4 })).toBe('welcome test, last login: a few days ago')
    expect($t('var', { name: 'test', num: 5 })).toBe('welcome test, last login: 5 days ago')
    expect($t('var', { name: 'test', num: 6 })).toBe('welcome test, last login: a few days ago')

    await changeLocale()

    expect($t('var', { name: 'test', num: 0 })).toBe('欢迎 test, 上次登录: 0 天前')
    expect($t('var', { name: 'test', num: 4 })).toBe('欢迎 test, 上次登录: 4 天前')
  })
  it('number', async () => {
    expect($n(1, 'currency')).toBe('$1.00')

    await changeLocale()

    expect($n(1, 'currency')).toBe('¥1.00')
  })

  it('date', async () => {
    const date = new Date('2000-01-01')
    expect($d(date, 'short')).toBe('1/1/00')
    expect($d(date, 'long')).toBe('January 1, 2000')
    expect($d(date, 'custom')).toBe('946684800000')

    await changeLocale()
    expect($d(date, 'short')).toBe('2000/1/1')
    expect($d(date, 'long')).toBe('2000年1月1日')
    expect($d(date, 'custom')).toBe('946684800000')
  })
})
