import { beforeEach, describe, expect, it } from 'vitest'
import type { Accessor } from 'solid-js'
import { createContext, useContext } from 'solid-js'
import type { I18nObject, I18nOptions } from '../src/i18n'
import { defineI18n, useStaticMessage } from '../src/i18n'
import { useTick } from '../src/hooks'
import type { MessageType } from '../src/i18n/types'

/**
 * initalize i18n
 * @param options i18n options
 * @see https://github.com/subframe7536/solid-dollar#i18n
 */
function $i18n<
  Locale extends string = string,
  Message extends MessageType<Locale> = any,
  NumberKey extends string = string,
  DatetimeKey extends string = string,
>(
  options: I18nOptions<Locale, Message, NumberKey, DatetimeKey>,
): Accessor<I18nObject<Locale, Message, NumberKey, DatetimeKey>> {
  const ctx = createContext<{
    data: I18nObject<Locale, Message, NumberKey, DatetimeKey> | undefined
  }>({ data: undefined })
  return () => {
    const _ = useContext(ctx)
    if (_.data) {
      return _.data
    }
    const data = defineI18n(options)
    _.data = data
    return data
  }
}

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
    message: useStaticMessage({ en, zh }),
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
  const { availableLocales, locale, $t, $d, $n, $scopeT } = useI18n()
  const $scopeTranslate = $scopeT('nest')
  beforeEach(() => {
    locale.$set('en')
  })

  async function changeLocale() {
    locale.$set('zh')
    await useTick()
  }

  it('translation', async () => {
    expect(availableLocales).toStrictEqual(['en', 'zh'])
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
