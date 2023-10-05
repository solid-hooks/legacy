<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=solid-dollar&background=tiles&project=%20" alt="solid-dollar">
</p>

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

console.log(data.$(1)) // 1

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
```

### `$resource`

object wrapper for `createResource`

```tsx
const fetcher = (source: string) => Promise.resolve(`${source} data`)
const data = $resource(fetcher, {
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

pausable and filterable `createEffect(on())`

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
  // createEffect `onOptions.defer`, default is true
  defer: false,
})
```

#### `$effect`

normal effect, alias for `createEffect`

#### `$renderEffect`

run effect after rendered, be able to access DOM, alias for `createRenderEffect`

#### `$instantEffect`

run effect instantly, alias for `createComputed`

### `$store`

object wrapper for `createStore`, return `$()` like object

#### `$trackStore`

Accessor wrapper for [`trackStore`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/deep#trackstore)

### `$deferred`

defer update notification until browser idle, alias for `createDeferred`

### `$selector`

object wrapper for `createSelector`

```tsx
const activeId = $selector(0)
activeId.$(1)

<For each={list()}>
  {item => <li classList={{ active: activeId.$bind(item.id) }}>
    {item.name}
   </li>}
</For>
```

---

## `solid-dollar/state`

### `$state`

global state with auto persistence

support run without provider (fallback to `createRoot`)

inspired by `pinia` & `zustand`

```tsx
const useTestState = $state('test', {
  $init: { value: 1 },
  $getter: state => ({
    // without param, will auto wrapped with `createMemo`
    doubleValue() {
      return state.value * 2
    },
  }),
  $action: stateObj => ({
    double(num: number) {
      stateObj.$('value', value => value * 2 * number)
    },
    plus(num: number) {
      stateObj.$('value', value => value + num)
    },
  }),
  $persist: {
    enable: true,
    storage: localStorage,
    path: ['test'] // type safe, support array
  },
}, true) // set true to enable DEV log

// usage
const state = useTestState()
render(() => (
  <StateProvider> {/* optional */}
    state: <p>{state().value}</p>
    getter: <p>{state.$.doubleValue()}</p>
    action: <button onClick={state.double}>double</button>
    action: <button onClick={() => state.plus(2)}>plus 2</button>
  </StateProvider>
))

// use produce()
state.$patch((state) => {
  state().test = 3
})
// use reconcile()
state.$patch({
  test: 2
})

// watch
const { pause, resume, isWatching } = state.$subscribe(
  (state) => console.log(state),
  { defer: true },
)

// reset
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

```tsx
const en = { t: '1', deep: { t: '{name}' }, plural: '{day}' }
const zh = { t: '2', deep: { t: '{name}' }, plural: '{day}(0=zero|1=one)' }
export const useI18n = $i18n({
  message: { 'en': en, 'zh-CN': zh },
  defaultLocale: 'en',
  datetimeFormats: {
    'en': {
      short: { dateStyle: 'short' },
      long: { dateStyle: 'long' },
      custom: d => d.getTime().toString(),
    },
    'zh-CN': {
      short: { dateStyle: 'short' },
      long: { dateStyle: 'full' },
      custom: d => d.getTime().toString(),
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

<I18nProvider>{/* optional */}
  <select onChange={e => locale.$(e.target.value)}>
    <For each={availiableLocales}>
      {l => <option selected={l === locale()}>{l}</option>}
    </For>
  </select>
  <div>{$t('t')}</div>
  <br />
  <div>{$t('t.deep', { name: 'test' })}</div>
  <div>{$t('plural', { day: 1 })}</div>
  <div>{$d(new Date())}</div>
  <div>{$d(new Date(), 'long')}</div>
  <div>{$d(new Date(), 'long', 'en')}</div>
  <div>{$n(100, 'currency')}</div>
</I18nProvider>
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
      include: './src/i18n/locales/*.yml',
      transformMessage: content => parse(content),
      // generate yml for https://github.com/lokalise/i18n-ally/wiki/Custom-Framework
      generateConfigYml: true,
    }),
  ],
})
```
see more at [`dev/`](/dev) and [`test`](/test/i18n.test.ts)

---

## `solid-dollar/utils`

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

  // auto emit after setter, inspird by `defineModel` in Vue
  const var = useEmits('var', 1)
  const handleClick = () => {
    var.$(v => v + 1)

    // manully emit
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

### `$tick`

vue-like next tick, [reference](https://github.com/solidjs-use/solidjs-use/blob/main/packages/solid-to-vue/src/scheduler.ts)

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

#### install

```ts
pnpm add -D idb-keyval
```

#### example

```ts
const { useIDB, idb, clearAll } = $idb({ name: 'dbName' })

const foo = useIDB('foo', 'initial value')

foo.$('test')

await foo.$del()
await clearAll()
```

### `$ctx`

object style [createContextProvider](https://github.com/solidjs-community/solid-primitives/tree/main/packages/context#createcontextprovider)

if use context outside provider, throw `Error` when DEV

```ts
const { useDate, DateProvider } = $ctx('date', () => new Date())
```

### `$ref`

`$()` like wrapper to make object props reactive

```ts
const value = {
  deep: {
    data: 'str',
  },
}

const bar = $ref(value, 'deep.data')

bar() // 'str'
bar.$('updated') // 'update'
bar() // 'updated'
```