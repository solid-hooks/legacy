import { DEV, Suspense, createComponent, createContext, useContext } from 'solid-js'
import { makeEventListener } from '@solid-primitives/event-listener'
import { $, type SignalObject } from '../signal'
import type {
  DateTimeFormatItem,
  I18nObject,
  I18nObjectContext,
  I18nOptions,
  MessageType,
  NumberFormatItem,
} from './types'
import { translate } from './utils'

/**
 * initalize i18n and return `I18nProvider` and `useI18n`
 * @param options i18n options
 * @see https://github.com/subframe7536/solid-dollar#i18n
 */
export function $i18n<
  Locale extends string = string,
  Message extends MessageType<Locale> = any,
  NumberKey extends string = string,
  DatetimeKey extends string = string,
>(
  options: I18nOptions<Locale, Message, NumberKey, DatetimeKey>,
): I18nObjectContext<Locale, Message, NumberKey, DatetimeKey> {
  const ctx = createContext<I18nObject<Locale, Message, NumberKey, DatetimeKey>>()
  return {
    I18nProvider: (props) => {
      const { suspense, ...data } = defineI18n(options)
      function createPropvider() {
        return createComponent(ctx.Provider, {
          value: data,
          get children() {
            return props.children
          },
        })
      }
      return (props.useSuspense === false || !suspense)
        ? createPropvider()
        : createComponent(Suspense, {
          fallback: props.useSuspense === true ? undefined : props.useSuspense,
          get children() {
            return createPropvider()
          },
        })
    },
    useI18n: DEV
      ? () => {
          const _ = useContext(ctx)
          if (!_) {
            throw new Error('no <I18nProvider /> wrapped!')
          }
          return _
        }
      : () => useContext(ctx)!,
  }
}

export function defineI18n<
  Locale extends string = string,
  Message extends MessageType<Locale> = any,
  NumberKey extends string = string,
  DatetimeKey extends string = string,
>(
  options: I18nOptions<Locale, Message, NumberKey, DatetimeKey>,
): I18nObject<Locale, Message, NumberKey, DatetimeKey> & { suspense?: boolean } {
  const {
    message,
    defaultLocale = navigator?.language || 'en' as any,
    datetimeFormats,
    numberFormats,
  } = options
  const loc = $(defaultLocale, { name: '$i18n-locale' })
  const {
    currentMessage,
    availableLocales,
    suspense,
  } = message(loc as unknown as SignalObject<Locale>)

  const datetimeFormatMap = new Map<string, Record<string, DateTimeFormatItem>>()
  const numberFormatMap = new Map<string, Record<string, NumberFormatItem>>()

  // setup datetime formatters
  for (const [l, datetimeFormat] of Object.entries(datetimeFormats || {})) {
    const obj = {} as Record<string, DateTimeFormatItem>
    for (const [key, config] of Object.entries(datetimeFormat || {})) {
      obj[key] = typeof config === 'function'
        ? config
        : new Intl.DateTimeFormat(l, config)
    }
    datetimeFormatMap.set(l, obj)
  }

  // setup number formatters
  for (const [l, numberFormat] of Object.entries(numberFormats || {})) {
    const obj = {} as Record<string, NumberFormatItem>
    for (const [key, config] of Object.entries(numberFormat || {})) {
      obj[key] = typeof config === 'function'
        ? config
        : new Intl.NumberFormat(l, config)
    }
    numberFormatMap.set(l, obj)
  }

  makeEventListener(window, 'languagechange', () => {
    const l = navigator?.language
    l && loc.$set(l as any)
  })

  return {
    suspense,
    $t: (path, variables?) => translate(
      currentMessage(),
      path as any,
      variables as Record<string, any>,
    ),
    $scopeT: scope => (path, variables?) => translate(
      currentMessage(),
        `${scope}.${path}` as any,
        variables as Record<string, any>,
    ),
    $n: (num, type, l) => {
      const _ = numberFormatMap.get(l || loc())?.[type]
      return typeof _ === 'function'
        ? _(num)
        : _?.format(num) || num.toLocaleString(loc())
    },
    $d: (date, type, l) => {
      const _ = datetimeFormatMap.get(l || loc())?.[type]
      return typeof _ === 'function'
        ? _(date)
        : _?.format(date) || date.toLocaleString(loc())
    },
    locale: loc as SignalObject<any>,
    availableLocales,
  }
}
