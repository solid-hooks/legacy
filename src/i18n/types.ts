import type { Path, PathValue } from 'object-standard-path'
import type { AnyFunction, Prettify, StringKeys } from '@subframe7536/type-utils'
import type { Accessor, FlowComponent, JSXElement } from 'solid-js'
import type { SignalObject } from '../signal'

export type StringFallback<T, F = string> = T extends never ? F : T extends '' ? F : T
type ExtractVariable<S extends string, T extends string | number> =
  S extends `${infer _}{${infer P}}${infer Rest}`
    ? Rest extends `(${infer _})${infer _}`
      ? { [K in P]: number } & ExtractVariable<Rest, T>
      : { [K in P]: string | number } & ExtractVariable<Rest, T>
    : {}

type ParseMessage<S extends string> = Prettify<ExtractVariable<S, string>>
type ExtractMessage<T> = T extends Record<string, infer C>
  ? C extends AnyFunction ? any : C
  : never

/**
 * type of `import.meta.glob()`
 */
export type DynamicMessage = Record<string, Accessor<Promise<unknown>>>
export type MessageType<Locale extends string> =
  | Record<Locale, Record<string, any>>
  | DynamicMessage

export type GenerateMessageFn<
  Locale extends string,
  Message extends MessageType<Locale>,
> = (locale: SignalObject<Locale>) => {
  currentMessage: Accessor<Message[keyof Message] | undefined>
  availableLocales: Locale[]
  /**
   * whether to enable suspense
   */
  suspense?: boolean
}

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
   * function that load messages
   *
   * built-in: {@link useStaticMessage}, {@link useDynamicMessage}
   * @example
   * ```
   * useStaticMessage({
   *   en: {
   *     hello: 'hello {name}, {num}(1=one day|2-3,5=a few days|*=$ days) ago'
   *   }
   * })
   * ```
   * @example
   * ```
   * useDynamicMessage(
   *   import.meta.glob('./locales/*.json'),
   *   path => path.slice(10, -5)
   * )
   * ```
   */
  message: GenerateMessageFn<Locale, Message>
  /**
   * default locale
   */
  defaultLocale?: StringKeys<Message>
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

export type TranslateFn<
  Locale extends string,
  Message extends MessageType<Locale>,
> = <P extends string = Path<Message[Locale]>>(
  path: StringFallback<P>,
  ...args: keyof ParseMessage<PathValue<Message[Locale], P>> extends never
    ? [variables?: Record<string, string | number>]
    : [variables: ParseMessage<PathValue<Message[Locale], P>>]
) => string

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
  $t: TranslateFn<Locale, Message>
  /**
   * create scoped translater
   * @param scope message scope
   */
  $scopeT: <Scope extends Path<ExtractMessage<Message>>>(
    scope: Scope
  ) => TranslateFn<
    Locale,
    Message extends DynamicMessage
      ? any
      : Record<Locale, PathValue<ExtractMessage<Message>, Scope>>
  >
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
  availableLocales: string[]
}

export type ScopeMessage<
  Locale extends string,
  Message extends Record<string, any>,
  Scope extends string,
> = Message extends Function
  ? Record<string, Record<string, any>>
  : Record<Locale, PathValue<Message[Locale], Scope>>

export type I18nObjectContext<
  Locale extends string = string,
  Message extends MessageType<Locale> = MessageType<Locale>,
  NumberKey extends string = string,
  DatetimeKey extends string = string,
> = {
  /**
   * i18n provider
   */
  I18nProvider: FlowComponent<{
    /**
     * use boolean to control whether to use `<Suspense />`
     *
     * if is `JSX.Element`, set as fallback element
     *
     * effect when options.message returns `loading`
     */
    useSuspense?: JSXElement | boolean
  }>
  /**
   * use i18n context
   */
  useI18n: Accessor<I18nObject<Locale, Message, NumberKey, DatetimeKey>>
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

export type DateTimeFormatItem = Intl.DateTimeFormat | ((date: Date) => string)
export type NumberFormatItem = Intl.NumberFormat | ((num: number | bigint) => string)
