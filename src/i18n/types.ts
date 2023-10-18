import type { Path, PathValue } from 'object-standard-path'
import type { Prettify, StringKeys } from '@subframe7536/type-utils'
import type { SignalObject } from '../signal'

export type StringFallback<T, F = string> = T extends never ? F : T extends '' ? F : T
type ExtractVariable<S extends string, T extends string | number> =
  S extends `${infer _}{${infer P}}${infer Rest}`
    ? Rest extends `(${infer _})${infer _}`
      ? { [K in P]: number } & ExtractVariable<Rest, T>
      : { [K in P]: string | number } & ExtractVariable<Rest, T>
    : {}

type ParseMessage<S extends string> = Prettify<ExtractVariable<S, string>>

export type MessageType<Locale extends string> =
  | Record<Locale, Record<string, any>>
  | Record<string, () => Promise<{ default: any }>>

/**
 * options for {@link $i18n}
 */
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
   * @param path object path
   * @param variables message variables, match `{key}` in message
   */
  $t: <
    P extends string = Path<Message[Locale]>,
  >(
    path: StringFallback<P>,
    ...args: keyof ParseMessage<PathValue<Message[Locale], P>> extends never
      ? [variables?: Record<string, string | number>]
      : [variables: ParseMessage<PathValue<Message[Locale], P>>]
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

export type ScopeMessage<
  Locale extends string,
  Message extends Record<string, any>,
  Scope extends string,
> = Message extends Function
  ? Record<string, Record<string, any>>
  : Record<Locale, PathValue<Message[Locale], Scope>>

export type I18nObjectReturn<
  Locale extends string = string,
  Message extends MessageType<Locale> = MessageType<Locale>,
  NumberKey extends string = string,
  DatetimeKey extends string = string,
> = {
  /**
   * get I18nObject
   */
  (): I18nObject<Locale, Message, NumberKey, DatetimeKey>
  /**
   * get I18nObject with scope translator
   */
  <Scope extends Path<Message[Locale]>>(
    scope: StringFallback<Scope>
  ): I18nObject<Locale, ScopeMessage<Locale, Message, Scope>, NumberKey, DatetimeKey>
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
