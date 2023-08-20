import { bench, describe } from 'vitest'
import type { CxArgs } from '../src/cx'
import { $cx } from '../src/cx'

function $cxMap(...args: CxArgs) {
  return args.flat(2)
    .map(item => !!item && typeof item !== 'boolean'
      && (typeof item === 'object'
        ? Object.keys(item).filter(key => !!item[key]).join(' ')
        : `${item}`))
    .filter(Boolean)
    .join(' ')
}
export function $cxReduce(...args: CxArgs) {
  return args.flat(2)
    .reduce((cx, arg) => {
      !!arg && typeof arg !== 'boolean' && cx.push(
        typeof arg === 'object'
          ? Object.keys(arg).filter(k => !!arg[k]).join(' ')
          : arg as string, // auto toString when join
      )
      return cx
    }, [] as string[])
    .filter(Boolean)
    .join('')
}
export function $cxReduceString(...args: CxArgs) {
  return args
    .flat(2)
    .reduce((cx: string, arg) => {
      return cx += !!arg && typeof arg !== 'boolean'
        ? `${typeof arg === 'object'
          ? Object.keys(arg).filter(k => !!arg[k]).join(' ')
          : `${arg}`} `
        : ''
    }, '')
    .trimEnd()
}
describe('$cx', () => {
  const base = [
    null,
    false,
    0,
    '',
    [undefined],
    [false],
    [0],
    [''],
    'bg-rose-400',
    'hover:bg-blue-400',
    { 'enabled': true, 'disabled': false, 'm-1': undefined, 'm-2': null, 'm-3': 0, 'm-4': 1 },
    [{ 'enabled': true, 'disabled': false, 'm-1': undefined, 'm-2': null, 'm-3': 0, 'm-4': 1 }],
    ['font-bold', 'text-2xl'],
  ]
  const args = Array.from({ length: 10000 }, () => base).flat()
  bench('forof + string', () => {
    $cx(...args)
  }, { time: 1000 })
  bench('map + join', () => {
    $cxMap(...args)
  }, { time: 1000 })
  bench('reduce + join', () => {
    $cxReduce(...args)
  }, { time: 1000 })
  bench('reduce + string', () => {
    $cxReduceString(...args)
  }, { time: 1000 })
})