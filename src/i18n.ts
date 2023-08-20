import { pathGet } from 'object-standard-path'
import type { Path } from 'object-standard-path'
import { createContext, createResource, useContext } from 'solid-js'
import type { SignalObject } from './signal'
import { $ } from './signal'

export type I18nOption<
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
   * default locale
   */
  defaultLocale?: Locale & string
  /**
   * convert matched file path to key,
   * only effect when `message` is imported by `import.meta.glob`
   *
   * @param key matched message file path
   * @example path => path.slice(10, -4)
   */
  parseKey?: (key: string) => string
}

function parseMessage(
  imports: I18nOption['message'],
  parseKey: Required<I18nOption>['parseKey'],
) {
  return Object.entries(imports).reduce(
    (acc, [key, value]) => {
      const k = typeof value == 'function' ? parseKey(key) : key
      acc.availiableLocales.push(k)
      acc.messageMap.set(k, value)
      return acc
    },
    { messageMap: new Map(), availiableLocales: [] as string[] },
  )
}

function assertImportType(value: any, fn: I18nOption['parseKey']) {
  if (typeof value === 'function' && fn === undefined) {
    throw new Error('parseKey must be set when use import.meta.glob as message')
  }
}

type I18nContext<T extends Record<string, any>> = {
  /**
   * display message
   * @param path message access path
   */
  $t: (path: Path<T> extends '' ? string : Path<T>) => any
  /**
   * current locale
   */
  locale: SignalObject<string>
  /**
   * available locales
   */
  availiableLocales: string[]
}

/**
 * initalize i18n
 * @param option i18n option
 * @example
 * ```ts
 * const en = { t: 1, deep: { t: 1 } }
 * const zh = { t: 2, deep: { t: 2 } }
 * export const useI18n = $i18n<'en' | 'zh', typeof en>({
 *   message: { en, zh },
 *   defaultLocale: 'en',
 * })
 * // usage
 * const { $t, availiableLocales, locale } = useI18n()
 * ```
 * @example
 * ```ts
 * import { $i18n } from 'solid-dollar'
 * export const useI18n = $i18n({
 *   message: import.meta.glob('./locales/*.yml'),
 *   parseKey: path => path.slice(10, -5),
 * })
 * // usage
 * const { $t, availiableLocales, locale } = useI18n()
 * ```
 * vite.config.ts
 * ```ts
 * import { defineConfig } from 'vite'
 * import { parse } from 'yaml'
 * import { I18nPlugin } from 'solid-dollar/plugin'
 *
 * export default defineConfig({
 *   // ...
 *   plugins: [
 *     // ...
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
>(option: I18nOption<Locale, T>): () => I18nContext<T> {
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

  return () => useContext(ctx)
}
