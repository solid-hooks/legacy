import type { FlowProps, Owner } from 'solid-js'
import { DEV, createComponent, createContext, createEffect, createRoot, createSignal, getOwner, on, runWithOwner, useContext } from 'solid-js'
import { makeEventListener } from '@solid-primitives/event-listener'
import type { SignalObject } from '../signal'
import type { I18nObject, I18nObjectReturn, I18nOptions, MessageType } from './types'
import { parseMessage, scopeTranslateWrapper, translate } from './utils'

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
 * @see https://github.com/subframe7536/solid-dollar#i18n
 */
export function $i18n<
  Locale extends string = string,
  Message extends MessageType<Locale> = any,
  NumberKey extends string = string,
  DatetimeKey extends string = string,
>(
  options: I18nOptions<Locale, Message, NumberKey, DatetimeKey>,
): I18nObjectReturn<Locale, Message, NumberKey, DatetimeKey> {
  let build = () => createI18n(options)
  let log = DEV && console.log
  return (scope?: any) => {
    const ctx = useContext($I18N_CTX)
    const _data = ctx.data
    if (_data) {
      return scope ? scopeTranslateWrapper(_data, scope) : _data as any
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
      return scope ? scopeTranslateWrapper(result, scope) : result
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
    defaultLocale = navigator?.language || 'en' as any,
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
  makeEventListener(window, 'languagechange', () => {
    const l = navigator?.language
    l && setLoc(l as any)
  })
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

  const $t: I18nObject<Locale, Message>['$t'] = (path, variables?) => {
    return translate(curMsg(), path as any, variables as Record<string, any>)
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
