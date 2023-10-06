import type { Path } from 'object-standard-path'
import { pathGet } from 'object-standard-path'

// '2-3,5' => [2, 3, 5]
function rangeStringToNumbers(rangeString: string): number[] {
  return rangeString
    .split(',')
    .flatMap((range) => {
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(n => +n)
        if (!Number.isNaN(start) && !Number.isNaN(end)) {
          return Array.from({ length: Math.abs(start! - end!) + 1 }, (_, i) => start! + i)
        }
      } else if (!Number.isNaN(+range)) {
        return [+range]
      }
      return []
    })
}

function convertPlural(originalStr: string, configs: string, num: number): string {
  const ret = (str: string) => str.replace(/\$/g, `${num}`)

  // ['1=one test', '2-3=$ tests', '*=$ testss']
  for (const config of configs.split('|')) {
    // ['1', 'one test'] | ['2-3,5', '$ tests'] | ['*', '$ testss']
    const [condition, str] = config.split('=').map(s => s.trim())

    if (!condition || !str) {
      return originalStr
    }

    // ['*']
    if (condition === '*') {
      return ret(str)
    }

    // ['2-3,5', '$ tests']
    if (Number.isNaN(+condition)) {
      // ['2', '3', '5']
      const range = rangeStringToNumbers(condition)

      if (range.includes(num)) {
        // '2 tests'
        return ret(str)
      }
    } else if (num === +condition) {
      // ['1', 'one test']
      return ret(str)
    }
  }
  return originalStr
}

// {name}
const varRegex = /{([^{}]+)}(?!\()/g
// {num}(1=one test|2-3,5=$ tests|*=$ testss)
const pluralRegex = /{([\w\d]+)}\(([^()]+)\)/g

/**
 * display message, support plural
 * @param message message object
 * @param path object path, support nest and []
 * @param variable message variables, match `{key}` in message
 * @example
 * translate(
 *   { test: { hello: 'hello {name}, {num}(1=one day|2-3,5=a few days|*=$ days) ago' } },
 *   'test.hello',
 *   { name: 'test', num: 2 }
 * )
 * // 'hello test, a few days ago'
 */
export function translate<T extends Record<string, any>>(
  message: T | undefined,
  path: Path<T> extends '' ? string : Path<T>,
  variable?: Record<string, string | number>,
): string {
  return `${pathGet(message, path as any) || ''}`
    .replace(varRegex, (_, key) => pathGet(variable, key))
    .replace(pluralRegex, (originalStr, key, configs) => {
      const num = +pathGet(variable, key)
      return Number.isNaN(num)
        ? originalStr
        : convertPlural(originalStr, configs, num)
    })
}

export function parseMessage<
  Locale extends string,
  Message extends Record<Locale, Record<string, any>> | Record<string, () => Promise<unknown>>,
>(
  imports: Message,
  parseKey?: (key: string) => string,
) {
  const messageMap = new Map<string, Message[keyof Message]>()
  const availiableLocales: Locale[] = []
  for (const [key, value] of Object.entries(imports)) {
    const k = (typeof value == 'function' ? parseKey?.(key) || key : key) as Locale
    availiableLocales.push(k)
    messageMap.set(k, value)
  }
  return { messageMap, availiableLocales }
}