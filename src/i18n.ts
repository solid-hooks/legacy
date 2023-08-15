import { pathGet } from 'object-standard-path'
import type { Path } from 'object-standard-path'
import { createContext, createResource, useContext } from 'solid-js'
import { $ } from './signal'

type I18nOption<
  Locale extends string = string,
  T extends Record<string, any> = any,
> = {
  /**
   * locale messages
   * @example
   * ```
   * { en: { hello: 'hello' } }
   * ```
   * @example
   * `parseKey()` **must be set**
   * ```
   * import.meta.glob('./locales/*.json')
   * ```
   */
  message: Record<Locale, T | (() => Promise<unknown>)>
  /**
   * convert matched file path to key
   *
   * @param key matched message file path
   * @example path => path.slice(10, -4)
   */
  parseKey?: (key: string) => string
  /**
   * default locale
   */
  defaultLocale?: Locale & string
}

export function parseMessage(
  imports: I18nOption['message'],
  parseKey: Required<I18nOption>['parseKey'],
) {
  const availiableLocales: string[] = []
  const messageMap = new Map(Object.entries(imports)
    .map(([key, value]) => {
      const k = typeof value == 'function'
        ? parseKey(key)
        : key
      availiableLocales.push(k)
      return [k, value]
    }),
  )
  return {
    messageMap,
    availiableLocales,
  }
}

function assertImportType(value: any, fn: I18nOption['parseKey']) {
  if (typeof value === 'function' && fn === undefined) {
    throw new Error('parseKey must be set when use import.meta.glob as message')
  }
}

/**
 * create i18n
 * @param option i18n option
 * @example
 * ```ts
 * const en = { t: 1, deep: { t: 1 } }
 * const zh = { t: 2, deep: { t: 2 } }
 * const { $t, availiableLocales, locale } = $i18n<'en' | 'zh'>({
 *   message: { en, zh },
 *   defaultLocale: 'en',
 * })
 * ```
 * @example
 * ```ts
 * import { $i18n } from 'solid-dollar'
 * export const { $t, availiableLocales, locale } = $i18n({
 *   message: import.meta.glob('./locales/*.yml'),
 *   parseKey: path => path.slice(10, -5),
 * })
 * ```
 * vite.config.ts
 * ```ts
 * import { defineConfig } from 'vite'
 * import { parse } from 'yaml'
 * import { I18nPlugin } from 'solid-dollar/plugin'
 *
 * export default defineConfig({
 *   ...
 *   plugins: [
 *     ...
 *     I18nPlugin({
 *       include: 'i18n/locales/*.yml',
 *       transformMessage: content => parse(content),
 *     }),
 *   ],
 * })
 * ```
 */
export function $i18n<
  Locale extends string = string,
  T extends Record<string, any> = {},
>(option: I18nOption<Locale, T>) {
  const { message, parseKey, defaultLocale } = option
  assertImportType(Object.values(message)[0], parseKey)
  const { availiableLocales, messageMap } = parseMessage(message, parseKey!)

  const locale = $(defaultLocale || navigator?.language || availiableLocales[0] || 'en')
  const [currentMessage] = createResource(locale, async (l) => {
    document?.querySelector('html')?.setAttribute('lang', l)
    if (!messageMap.has(l)) {
      throw new Error(`unsupported locale: ${l}, availiable: [${availiableLocales}]`)
    }
    const msg = messageMap.get(l)
    return typeof msg === 'function'
      ? (await msg() as { default: any }).default
      : msg
  })

  const $t = (path: Path<T> extends '' ? string : Path<T>) => {
    return pathGet(currentMessage(), path as any)
  }

  const ctx = createContext({
    $t,
    locale,
    availiableLocales,
  })

  return useContext(ctx)
}
