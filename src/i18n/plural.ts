// '2-3,5' => [2, 3, 5]
function convertRangeStringToNumbers(rangeString: string): number[] {
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
// '1=one test|2-3=$ tests|*=$ testss'
export function convertPlural(originalStr: string, configs: string, num: number): string {
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
      const range = convertRangeStringToNumbers(condition)

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
