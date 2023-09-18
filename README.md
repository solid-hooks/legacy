# solid-dollar

object style hooks / i18n / global state management for solid.js

# install

```shell
npm i solid-dollar
```
```shell
yarn add solid-dollar
```
```shell
pnpm add solid-dollar
```

# usage

## `solid-dollar`

### `$`

object wrapper for `createSignal`

```ts
const data = $(0)

console.log(data()) // 0

console.log(data.$set(1)) // 1

console.log(data()) // 1

console.log(data.$signal) // original signal

const hooks = $('hello', {
  preSet: v => v + ' hooks',
  postSet: newV => console.log(newV)
})
// log: 'hello hooks'
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

### `$watch`

pausable and filterable `createEffect`

```ts
const str = $('old')
const callback = console.log
function filter(newValue: string, times: number) {
  return newValue !== 'new'
}
const {
  isWatching,
  pause,
  resume,
  runWithoutEffect,
} = $watch(str, callback, {
  // function for trigger callback, like `debounce()` or `throttle()` in `@solid-primitives/scheduled`
  triggerFn: fn => throttle(fn, 500),
  // function for filter value
  filterFn: filter,
  // createEffect `onOptions.defer`
  defer: true,
})
```

### `$store`

object wrapper for `createStore`, return `$()` like object

#### `$trackStore`

Accessor wrapper for [`trackStore`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/deep#trackstore)

---

## `solid-dollar/state`

### `$state`

global state with auto persistence, without provider

inspired by `pinia` & `zustand`

```tsx
const useTestState = $state('test', {
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
const state = useTestState()
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

---

## `solid-dollar/i18n`

### `$i18n`

simple i18n, support async load message file

to get typesafe i18n:
1. add first type param `Locale` of `$i18n`,
2. set `datetimeFormats`/`numberFormats` keys,
3. remove useless `Locale`, the `$i18n()` is typesafe

or separately define `datetimeFormats`/`numberFormats`
with manually type declartion using type `DatetimeFormats`/`NumberFormats`

#### `$i18nContext`

`$i18n` with context and provider

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

// $18nContext
export const { I18nProvider, useI18n } = $i18nContext({ /*options*/ })
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

---

## `solid-dollar/utils`

### `$idle`

wrapper for `window.requestIdleCallback`, with cleanup

fallback to `window.requestAnimationFrame` or execute it directly

### `$emits`

util for child component event emitting, auto handle optional prop

#### example

```tsx
type Emits = {
  var: number
  update: [d1: string, d2?: string, d3?: string]
  optional?: { test: number }
}

function Child(props: EmitProps<Emits, { num: number }>) {
  const { emit, useEmits } = $emits<Emits>(props)
  const v = useEmits('var', 1)
  const handleClick = () => {
    v.$set(v => v + 1)
    emit('update', `emit from child: ${props.num}`, 'second')
    emit('optional', { test: 1 })
  }
  return (<div>
    child:
    {props.num}
    <button onClick={handleClick}>+</button>
  </div>)
}
function Father() {
  const count = $('init')
  return <Child num={count()}
    $update={console.log}
    $var={e => console.log('useEmits:', e)}
  />
}
```

### `$model`

simple two-way binding directive for `<input>`, `<textare>`, `<select>`, and others (customable)

```tsx
const msg = $('')
<input type="text" use:$model={[msg]}>
```

type:

```ts
export type ModelParam = [
  /**
   * binded signal
   */
  signal: SignalObject<any>,
  config?: {
    /**
     * trigger event
     */
    event?: keyof HTMLElementEventMap & string
    /**
     * event target property
     */
    property?: string
    /**
     * update signal with event target property
     * @param eventTargetPropertyValue `event.target[property]`
     * @returns signal value
     */
    updateSignal?: (eventTargetPropertyValue: any) => any
    /**
     * update element property with signal
     * @param signalValue `signal()`
     * @returns el[property] value
     */
    updateProperty?: (signalValue: any) => any
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
      import: [...$autoImport(true)],
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
)}
/>
```

### `$tick`

vue-like next tick, [reference](https://github.com/solidjs-use/solidjs-use/blob/main/packages/solid-to-vue/src/scheduler.ts)

### `$runWithOwner`

wrapper for `runWithOwner` + `getOwner`

the [official use case](https://www.solidjs.com/docs/latest/api#runwithowner) can transfer to:

```ts
const run = $runWithOwn(() => {
  const foo = useContext(FooContext)
  createEffect(() => {
    console.log(foo)
  })
})
setTimeout(() => run, 1000)
```

### `$app`

Vue's `createApp` like initialization, works in both `.ts` and `.tsx`

```ts
import App from './App'

$app(App)
  .use(RouterProvider)
  .use(I18nProvider, { dict })
  .use(GlobalStoreProvider)
  .mount('#app')
```

is equal to:

```tsx
render(
  <RouterProvider>
    <I18nProvider dict={dict}>
      <GlobalStoreProvider>
        <App />
      </GlobalStoreProvider>
    </I18nProvider>
  </RouterProvider>,
  document.querySelector('#app')
)
```

reference from [solid-utls](https://github.com/amoutonbrady/solid-utils#createapp)

### `$idb`

create function to generate `$()` like IndexedDB wrapper, using [idb-keyval](https://github.com/jakearchibald/idb-keyval)

no serializer, be caution when store `Proxy`

```ts
const { useIDB, idb, clearAll } = $idb({ name: 'dbName' })

const foo = useIDB('foo', 'initial value')

foo.$set('test')

await foo.$del()
await clearAll()
```

### `$noThrow`

auto catch and normalize error

### `$ctx`

object style [createContextProvider](https://github.com/solidjs-community/solid-primitives/tree/main/packages/context#createcontextprovider)

if use context outside provider, throw Error when DEV

```ts
const { useDate, DateProvider } = $ctx('date', () => new Date())
```