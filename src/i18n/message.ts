import { createMemo, createResource } from 'solid-js'
import type { DynamicMessage, GenerateMessageFn } from './types'

/**
 * load static message
 * @param message static message
 * @see https://github.com/subframe7536/solid-dollar#static-message
 */
export function useStaticMessage<
  Locale extends string,
  Message extends Record<Locale, Record<string, any>>,
>(
  message: Message,
): GenerateMessageFn<Locale, DynamicMessage> {
  const map = new Map<string, any>(Object.entries(message))
  const availableLocales = Object.keys(message) as Locale[]
  return (locale) => {
    const currentMessage = createMemo(() => map.get(locale()), undefined, { name: '$i18n-message' })
    return { availableLocales, currentMessage }
  }
}

/**
 * load from dynamic message
 * @param imports `import.meta.glob('...')`
 * @param parseKey parse key string
 * @see https://github.com/subframe7536/solid-dollar#dynamic-message
 */
export function useDynamicMessage<
  Locale extends string,
>(
  imports: DynamicMessage,
  parseKey: (key: string) => string,
): GenerateMessageFn<Locale, DynamicMessage> {
  const messageMap = new Map<string, () => Promise<{ default: any }>>()
  const availableLocales: Locale[] = []
  for (const [key, value] of Object.entries(imports)) {
    const k = parseKey(key) as Locale
    availableLocales.push(k)
    messageMap.set(k, value as () => Promise<{ default: any }>)
  }
  return (locale) => {
    const [currentMessage] = createResource(locale, async (l) => {
      document?.querySelector('html')?.setAttribute('lang', l)
      if (!messageMap.has(l)) {
        throw new Error(`unsupported locale: ${l}, availiable: [${availableLocales}]`)
      }
      const getMessage = messageMap.get(l)!
      return (await getMessage()).default
    }, { name: '$i18n-message' })
    return {
      currentMessage,
      availableLocales,
      suspense: true,
    }
  }
}
