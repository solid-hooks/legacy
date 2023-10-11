import type { Path } from 'object-standard-path'
import type { StringKeys } from '@subframe7536/type-utils'
import type { SignalObject } from '../signal'

export type MessageType<Locale extends string> =
  | Record<Locale, Record<string, any>>
  | Record<string, () => Promise<{ default: any }>>

export type I18nOptions<
  Locale extends string = string,
  Message extends MessageType<Locale> = any,
  NumberKey extends string = string,
  DatetimeKey extends string = string,
> = {
  /**
   * locale messages
   * @example
   * ```
   * {
   *   en: {
   *     hello: 'hello {name}, {num}(1=one day|2-3,5=a few days|*=$ days) ago'
   *   }
   * }
   * ```
   * @example
   * `parseKey()` **must be set**
   * ```
   * import.meta.glob('./locales/*.json')
   * ```
   */
  message: Message
  /**
   * default locale, fallback to `navigator?.language, 'en'`
   */
  defaultLocale?: StringKeys<Message>
  /**
   * convert matched file path to key,
   * only effect when `message` is imported by `import.meta.glob`
   *
   * @param key matched message file path
   * @example path => path.slice(10, -4)
   */
  parseKey?: (key: string) => string
  /**
   * number formatters config,
   * support {@link NumberFormatOptions} or custom function
   * @example
   * {
   *   'en': {
   *     currency: { style: 'currency', currency: 'USD' },
   *     custom: n => n + '.00'
   *   },
   *   'zh-CN': {
   *     currency: { style: 'currency', currency: 'CNY' },
   *     custom: n => n + '.00'
   *   },
   * }
   */
  numberFormats?: NumberFormats<Locale, NumberKey>
  /**
   * date formatters config,
   * support {@link DateTimeFormatOptions} or custom function
   * @example
   * {
   *   datetimeFormats: {
   *     'en': {
   *       short: { dateStyle: 'short' },
   *       long: { dateStyle: 'long' },
   *       custom: d => d.getTime().toString(),
   *     },
   *     'zh-CN': {
   *       short: { dateStyle: 'short' },
   *       long: { dateStyle: 'full' },
   *       custom: d => d.getTime().toString(),
   *     },
   *   },
   * }
   */
  datetimeFormats?: DateTimeFormats<Locale, DatetimeKey>
}

/**
 * type of {@link $i18n}
 */
export type I18nObject<
  Locale extends string = string,
  Message extends MessageType<Locale> = MessageType<Locale>,
  NumberKey extends string = string,
  DatetimeKey extends string = string,
> = {
  /**
   * display message, support plural
   * @param path object path, support nest and []
   * @param variable message variables, match `{key}` in message
   */
  $t: (
    path: Path<Message[Locale]> extends '' ? string : Path<Message[Locale]>,
    variable?: Record<string, string | number>
  ) => string
  /**
   * localize number
   *
   * if type is not defined or set, fallback to `(Number/Bigint).toLocaleString([locale(), 'en'])`
   * @param num number value
   * @param type predefined number type
   * @param locale custom locale
   */
  $n: (num: number | bigint, type: NumberKey, locale?: Locale) => string
  /**
   * localize date
   *
   * if type is not defined or set, fallback to `Date.toLocaleString([locale(), 'en'])`
   * @param date date value
   * @param type predefined date type
   * @param locale custom locale
   */
  $d: (date: Date, type: DatetimeKey, locale?: Locale) => string
  /**
   * current locale
   */
  locale: SignalObject<string>
  /**
   * all available locales
   */
  availiableLocales: string[]
}

// reference from https://github.com/intlify/vue-i18n-next/blob/master/packages/core-base/src/types/intl.ts

// === date ===

export type DateTimeHumanReadable = 'long' | 'short' | 'narrow'
export type DateTimeDigital = 'numeric' | '2-digit'
export type LocaleMatcher = 'lookup' | 'best fit'
export type FormatMatcher = 'basic' | 'best fit'

export interface SpecificDateTimeFormatOptions extends Intl.DateTimeFormatOptions {
  year?: DateTimeDigital
  month?: DateTimeDigital | DateTimeHumanReadable
  day?: DateTimeDigital
  hour?: DateTimeDigital
  minute?: DateTimeDigital
  second?: DateTimeDigital
  weekday?: DateTimeHumanReadable
  era?: DateTimeHumanReadable
  timeZoneName?: 'long' | 'short'
  localeMatcher?: LocaleMatcher
  formatMatcher?: FormatMatcher
}
export type DateTimeFormatOptions =
  | Intl.DateTimeFormatOptions
  | SpecificDateTimeFormatOptions

export type DateTimeFormat<T extends string> = Record<T, DateTimeFormatOptions | ((date: Date) => string)>

export type DateTimeFormats<Locale extends string = string, Key extends string = string> = Record<Locale, DateTimeFormat<Key>>

// === number ===

export type CurrencyDisplay = 'symbol' | 'code' | 'name'

export interface SpecificNumberFormatOptions extends Intl.NumberFormatOptions {
  style?: 'decimal' | 'percent'
  currency?: string
  currencyDisplay?: CurrencyDisplay
}

export interface CurrencyNumberFormatOptions extends Intl.NumberFormatOptions {
  style: 'currency'
  currency: string
  currencyDisplay?: CurrencyDisplay
}

export type NumberFormatOptions =
  | Intl.NumberFormatOptions
  | SpecificNumberFormatOptions
  | CurrencyNumberFormatOptions
export type NumberFormat<T extends string> = Record<T, NumberFormatOptions | ((num: number | bigint) => string)>

export type NumberFormats<Locale extends string = string, Key extends string = string> = Record<Locale, NumberFormat<Key>>
