# solid-dollar

hooks for solid.js

## install

```shell
npm i solid-dollar
```
```shell
yarn add solid-dollar
```
```shell
pnpm add solid-dollar
```

## usage

### `$`

object wrapper for `createSignal`

```ts
const data = $(0)

console.log(data()) // 0

console.log(data.$set(1)) // 1

console.log(data()) // 1

console.log(data.$signal) // original signal
```

#### `$$`

`untrack` alias

### `$memo`

object wrapper for `createMemo`

```ts
const test = $('test')

const memoByValue = $memo(`value: ${test()}`)

const fn = v => `value: ${v}`
const memoByFn = $memo(fn, test())
```

### `$res`

object wrapper for `createResource`

```tsx
const fetcher = (source: string) => Promise.resolve(`${source} data`)
const data = $res(fetcher, {
  /**
   * source signal
   */
  $: $('source'),
  initialValue: 'test'
})

data() // 'test'
data.loading // true
data.state // pending

await Promise.resolve()

data() // 'source data'
data.loading // false
data.state // ready

data.$mutate()
data.$refetch()
```

### `$store`

object wrapper for `createStore`, return `$()` like object

### `$state`

global state with auto persistence, without provider

inspired by `pinia` & `zustand`

```tsx
const useState = $state('test', {
  $init: { value: 1 },
  $action: (state, setState) => ({
    doubleValue() {
      return state.value * 2
    },
    double(num: number) {
      setState('value', value => value * 2 * number)
    },
    plus(num: number) {
      setState('value', value => value + num)
    },
  }),
  $persist: {
    enable: true,
    storage: localStorage,
    path: ['test'] // type safe, support `[]`
  },
})
const state = useState()
render(() => (
  <div>
    <p>{state().value}</p>
    <p>{state.doubleValue(2)}</p>
    <button onClick={state.double()}>double</button>
    <button onClick={() => state.plus(2)}>plus 2</button>
  </div>
))
// use produce()
state.$patch((state) => {
  state().test = 3
})
// use reconcile()
state.$patch({
  test: 2
})
const unsubscribe = state.$subscribe((state) => {
  console.log(state)
})
unsubscribe()
state.$reset()
```

#### `$trackStore`

Accessor wrapper for [`trackStore`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/deep#trackstore)

### `$watch`

pausable and filterable `createEffect`

```ts
const str = $('old')
const callback = console.log
const filter = (newValue: string, times: number) => {
  return newValue !== 'new'
}
const {
  isWatching,
  pause,
  resume,
  runWithoutEffect,
} = $watch(str, callback, {
  callFn: throttle, // function for trigger callback, like `debounce()` or `throttle()` in `@solid-primitives/scheduled`
  filterFn: filter, // function for filter value
  defer: true, // createEffect defer
})
```

### `$i18n`

simple i18n, support async load message file

to get typesafe i18n:
1. add first type param `Locale` of `$i18n`,
2. set `datetimeFormats`/`numberFormats` keys,
3. remove useless `Locale`, the `$i18n()` is typesafe

or separately define `datetimeFormats`/`numberFormats`
with manually type declartion using type `DatetimeFormats`/`NumberFormats`


#### variable syntax

`{variable}`

e.g.
```ts
const en = { var: 'show {variable}' }
$t('var', { variable: 'text' }) // show text
```

#### plural syntax

`{variable}(case=text|case=text)`

- case: support number(seprated by ',') / range(seprated by `-`) / '*'(fallback cases)
- text: plural text, use `$` to show matched variable

e.g.
```ts
const en = { plural: 'at {var}(1=one day|2-3,5=a few days|*=$ days) ago' }
$t('plural', { var: 1 }) // at one day ago
$t('plural', { var: 2 }) // at a few days ago
$t('plural', { var: 4 }) // at 4 days ago
$t('plural', { var: 5 }) // at a few days ago
```

#### example

```ts
const en = { t: 1, deep: { t: 1 } }
const zh = { t: 2, deep: { t: 2 } }
export const useI18n = $i18n({
  message: { 'en': en, 'zh-CN': zh },
  defaultLocale: 'en',
  datetimeFormats: {
    'en': {
      short: { dateStyle: 'short' },
      long: { dateStyle: 'long' },
    },
    'zh-CN': {
      short: { dateStyle: 'short' },
      long: { dateStyle: 'long' },
    },
  },
  numberFormats: {
    'en': {
      currency: { style: 'currency', currency: 'USD' },
    },
    'zh-CN': {
      currency: { style: 'currency', currency: 'CNY' },
    },
  },
})
// usage
const { $t, $d, $n, availiableLocales, locale } = useI18n()
```

load on demand:
```ts
export const useI18n = $i18n({
  message: import.meta.glob('./locales/*.yml'),
  parseKey: path => path.slice(10, -5),
})
```
to convert yml, setup built-in vite plugin

vite.config.ts
```ts
import { defineConfig } from 'vite'
import { parse } from 'yaml'
import { I18nPlugin } from 'solid-dollar/plugin'

export default defineConfig({
  // ...
  plugins: [
    // ...
    I18nPlugin({
      include: 'i18n/locales/*.yml',
      transformMessage: content => parse(content),
    }),
  ],
})
```
see more at [`dev/`](/dev) and [`test`](/test/i18n.test.ts)

### `$idle`

wrapper for `window.requestIdleCallback`, with cleanup

fallback to `window.requestAnimationFrame` or execute it directly

### `$model`

simple two-way binding directive for `<input>`, `<textare>`, `<select>`, and others (customable)

```tsx
const msg = $('')
<input type="text" use:$model={[msg]}>
```

type:

```ts
export type ModelParam = [
  signal: SignalObject<any>,
  config?: {
    event?: string
    value?: string
  },
]
```

#### typescript support

env.d.ts:
```ts
import { ModelDirective } from 'solid-dollar'

declare module 'solid-js' {
  namespace JSX {
    interface Directives extends ModelDirective {}
  }
}

export { }
```

#### auto import

use with [`unplugin-auto-import`](https://github.com/antfu/unplugin-auto-import)

vite.config.ts
```ts
import { defineConfig } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import { $autoImport } from 'solid-dollar/plugin'

export default defineConfig({
  plugins: [
    // ...
    AutoImport({
      import: [...$autoImport],
    }),
  ],
})
```

### `$cx`

classes generator, [clsx](https://github.com/lukeed/clsx) like but smaller(178B minified), flat deepth is 2

```tsx
<div class={$cx(
  'bg-rose-400 font-serif',
  'text-white',
  `hover:(
    bg-slate-400
    font-medium
  )`,
  count() === 2 && 'm-1',
  null,
  { 'enabled': true, 'disabled': false, 'm-1': 0, 'm-2': null },
)}/>
```

### `$tick`

vue-like next tick, [reference](https://github.com/solidjs-use/solidjs-use/blob/main/packages/solid-to-vue/src/scheduler.ts)

### `$runWithOwner`

wrapper for `runWithOwner` + `getOwner`

the [official use case](https://www.solidjs.com/docs/latest/api#runwithowner) can transfer to:

```ts
const run = $runWithOwn(() => {
  const foo = useContext(FooContext);
  createEffect(() => {
    console.log(foo);
  });
});
setTimeout(() => run, 1000);
```