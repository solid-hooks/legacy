import type { FlowProps, Owner } from 'solid-js'
import { DEV, createComponent, createContext, createEffect, createRoot, createSignal, getOwner, on, runWithOwner, useContext } from 'solid-js'
import type { SignalObject } from '../signal'
import type { I18nObject, I18nOptions, MessageType } from './types'
import { parseMessage, translate } from './utils'

function assertImportType(value: any, fn: I18nOptions['parseKey']) {
  if (typeof value === 'function' && fn === undefined) {
    throw new Error('parseKey must be set when use import.meta.glob as message')
  }
}
const $I18N_CTX = createContext<{
  owner: Owner | null
  data: I18nObject<any, any, any, any> | null
}>({
  owner: null,
  data: null,
})
/**
 * initalize i18n
 * @param options i18n options
 * @description
 * to get typesafe i18n:
 * 1. add first type param `Locale` of `$i18n`,
 * 2. set `datetimeFormats`/`numberFormats` keys,
 * 3. remove useless `Locale`, the `$i18n()` is typesafe
 *
 * or separately define `datetimeFormats`/`numberFormats`
 * with manually type declartion using type `DatetimeFormats`/`NumberFormats`
 * @description
 * variable syntax: `{variable}`
 *
 * e.g.
 * ```ts
 * const en = { var: 'show {variable}' }
 * $t('var', { variable: 'text' }) // show text
 * ```
 * @description
 * plural syntax: `{variable}(case=text|case=text)`
 * - case: support number(seprated by ',') / range(seprated by `-`) / '*'(fallback cases)
 * - text: plural text, use `$` to show matched variable
 *
 * e.g.
 * ```ts
 * const en = { plural: 'at {var}(1=one day|2-3,5=a few days|*=$ days) ago' }
 * $t('plural', { var: 1 }) // at one day ago
 * $t('plural', { var: 2 }) // at a few days ago
 * $t('plural', { var: 4 }) // at 4 days ago
 * $t('plural', { var: 5 }) // at a few days ago
 * ```
 * @example
 * ```tsx
 * const en = { t: '1', deep: { t: '{name}' }, plural: '{day}' }
 * const zh = { t: '2', deep: { t: '{name}' }, plural: '{day}(0=zero|1=one)' }
 * export const useI18n = $i18n({
 *   message: { 'en': en, 'zh-CN': zh },
 *   defaultLocale: 'en',
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
 *   numberFormats: {
 *     'en': {
 *       currency: { style: 'currency', currency: 'USD' },
 *       custom: n => n + '.00'
 *     },
 *     'zh-CN': {
 *       currency: { style: 'currency', currency: 'CNY' },
 *       custom: n => n + '.00'
 *     },
 *   },
 * })
 * // usage
 * const { $t, $d, $n, availiableLocales, locale } = useI18n()
 *
 * <I18nProvider> // optional
 *   <select onChange={e => locale.$(e.target.value)}>
 *     <For each={availiableLocales}>
 *       {l => <option selected={l === locale()}>{l}</option>}
 *     </For>
 *   </select>
 *   <div>{$t('t')}</div>
 *   <br />
 *   <div>{$t('t.deep', { name: 'test' })}</div>
 *   <div>{$t('plural', { day: 1 })}</div>
 *   <div>{$d(new Date())}</div>
 *   <div>{$d(new Date(), 'long')}</div>
 *   <div>{$d(new Date(), 'long', 'en')}</div>
 *   <div>{$n(100, 'currency')}</div>
 * </I18nProvider>
 * ```
 *
 * load on demand:
 * ```ts
 * export const useI18n = $i18n({
 *   message: import.meta.glob('./locales/*.yml'),
 *   parseKey: path => path.slice(10, -5),
 * })
 * ```
 * to convert yml, setup built-in vite plugin
 *
 * vite.config.ts
 * ```ts
 * import { defineConfig } from 'vite'
 * import { parse } from 'yaml'
 * import { I18nPlugin } from 'solid-dollar/plugin'
 *
 * export default defineConfig({
 *   plugins: [
 *     I18nPlugin({
 *       include: './src/i18n/locales/*.yml',
 *       transformMessage: content => parse(content),
 *       // generate yml for https://github.com/lokalise/i18n-ally/wiki/Custom-Framework
 *       generateConfigYml: true,
 *     }),
 *   ],
 * })
 * ```
 */
export function $i18n<
  Locale extends string = string,
  Message extends MessageType<Locale> = any,
  NumberKey extends string = string,
  DatetimeKey extends string = string,
  >(
  options: I18nOptions<Locale, Message, NumberKey, DatetimeKey>,
): () => I18nObject<Locale, Message, NumberKey, DatetimeKey> {
  let build = () => createI18n(options)
  let log = DEV && console.log
  return () => {
    const ctx = useContext($I18N_CTX)
    const _data = ctx.data
    if (_data) {
      return _data as any
    }
    function mount(
      result: I18nObject<Locale, Message, NumberKey, DatetimeKey>,
      msg: string,
    ) {
      ctx.data = result
      log?.(msg)
      // @ts-expect-error for GC
      build = null
      // @ts-expect-error for GC
      log = null
      return result
    }
    return ctx.owner
      ? runWithOwner(ctx.owner, () => mount(
        build(),
        DEV ? 'mount to <I18nProvider />' : '',
      ))
      : mount(
        createRoot(build),
        DEV ? '<I18nProvider /> is not set, fallback to use createRoot' : '',
      )
  }
}

/**
 * i18n provider
 */
export function I18nProvider(props: FlowProps) {
  const _owner = getOwner()
  if (DEV && !_owner) {
    throw new Error('<I18nProvider /> must be set inside component')
  }
  return createComponent($I18N_CTX.Provider, {
    value: {
      owner: _owner!,
      data: null,
    },
    get children() {
      return props.children
    },
  })
}

function createI18n<
  Locale extends string = string,
  Message extends MessageType<Locale> = any,
  NumberKey extends string = string,
  DatetimeKey extends string = string,
>(
  {
    message,
    parseKey,
    defaultLocale = navigator.language || 'en' as any,
    datetimeFormats,
    numberFormats,
  }: I18nOptions<Locale, Message, NumberKey, DatetimeKey>,
): I18nObject<Locale, Message, NumberKey, DatetimeKey> {
  assertImportType(Object.values(message)[0], parseKey)
  const {
    availiableLocales,
    messageMap,
  } = parseMessage<Locale, Message>(message, parseKey)

  type DateTimeFormatItem = Intl.DateTimeFormat | ((date: Date) => string)
  const datetimeFormatMap = new Map<string, Record<string, DateTimeFormatItem>>()

  type NumberFormatItem = Intl.NumberFormat | ((num: number | bigint) => string)
  const numberFormatMap = new Map< string, Record<string, NumberFormatItem>>()

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
  const [curMsg, setCurMsg] = createSignal<Record<string, any>>({}, { name: '$i18n-message' })

  const [loc, setLoc] = createSignal(defaultLocale, { name: '$i18n-locale' })
  // @ts-expect-error assign
  loc.$ = setLoc
  createEffect(on(loc, (l) => {
    document?.querySelector('html')?.setAttribute('lang', l)
    if (!messageMap.has(l)) {
      throw new Error(`unsupported locale: ${l}, availiable: [${availiableLocales}]`)
    }
    const msg = messageMap.get(l)!
    typeof msg === 'function'
      ? msg().then((val: { default: any }) => setCurMsg(val.default))
      : setCurMsg(msg as Record<string, any>)
  }))

  const $t: I18nObject<Locale, Message>['$t'] = (path, variable) => {
    return translate(curMsg(), path as any, variable)
  }

  const $n: I18nObject<Locale, Message>['$n'] = (num, type, l) => {
    const _ = numberFormatMap.get(l || loc())?.[type]
    return typeof _ === 'function'
      ? _(num)
      : _?.format(num) || num.toLocaleString(loc())
  }

  const $d: I18nObject<Locale, Message>['$d'] = (date, type, l) => {
    const _ = datetimeFormatMap.get(l || loc())?.[type]
    return typeof _ === 'function'
      ? _(date)
      : _?.format(date) || date.toLocaleString(loc())
  }

  return {
    $t,
    $n,
    $d,
    locale: loc as SignalObject<any>,
    availiableLocales,
  }
}
