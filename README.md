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
    debug: true,
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

#### normal load

see in [`test/i18n.test.ts`](test/i18n.test.ts)

#### async load

```tsx
const useI18n = $i18n({
  // message: import.meta.glob('./locales/*.json'),
  message: import.meta.glob('./locales/*.yml'),
  parseKey: path => path.slice(10, -4),
  defaultLocale: 'en',
})
const { $t, availableLocales, locale } = useI18n()
locale.$set('zh-CN')
<div>$t('deep.t')</div>
```

add plugin in vite.config.ts if the translation files are not `.json`
```ts
import { defineConfig } from 'vite'
import { parse } from 'yaml'
import { I18nPlugin } from 'solid-dollar/plugin'

export default defineConfig({
  /* ... */
  plugins: [
    /* ... */
    I18nPlugin({
      include: 'i18n/locales/*.yml',
      transformMessage: content => parse(content),
    }),
  ],
})
```

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