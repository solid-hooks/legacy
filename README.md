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
import { $ } from 'solid-dollar'

const data = $(0)

console.log(data()) // 0
console.log(data.$(1)) // set value
```

#### `$$`

`untrack` alias

### `$memo`

object wrapper for `createMemo`

```ts
import { $, $memo } from 'solid-dollar'

const test = $('test')
const memoByValue = $memo(`value: ${test()}`)
```

### `$resource`

object wrapper for `createResource`

```ts
import { $, $resource } from 'solid-dollar'

const fetcher = (source: string) => Promise.resolve(`${source} data`)
const source = $('source')
const data = $resource(source, fetcher, {
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
import { $watch } from 'solid-dollar'

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

```ts
import { $store } from 'solid-dollar'

const store = $store({ test: { deep: 1 } })

store() // { test: { deep: 1 } }
store.$('test', 'deep', 2) // set value
```

#### `$trackStore`

Accessor wrapper for [`trackStore`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/deep#trackstore)

### `$deferred`

defer update notification until browser idle, alias for `createDeferred`

### `$selector`

object wrapper for `createSelector`

```tsx
import { For } from 'solid-js'
import { $selector } from 'solid-dollar'

const activeId = $selector(0)
activeId.$(1)

return (
  <For each={list()}>
    {item => (
      <li classList={{ active: activeId.$bind(item.id) }}>
        {item.name}
      </li>
    )}
  </For>
)
```

---

## `solid-dollar/state`

### `$state`

global state with auto persistence

support run without provider (fallback to `createRoot`)

inspired by `pinia` & `zustand`

```tsx
import { $state, GlobalStateProvider } from 'solid-dollar/state'

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
  <GlobalStateProvider> {/* optional */}
    state: <p>{state().value}</p>
    getter: <p>{state.$.doubleValue()}</p>
    action: <button onClick={state.double}>double</button>
    action: <button onClick={() => state.plus(2)}>plus 2</button>
  </GlobalStateProvider>
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
  state => console.log(state),
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
import { For } from 'solid-js'
import { $i18n, I18nProvider } from 'solid-dollar/i18n'

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

return (

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
)
```

load on demand:
```ts
export const useI18n = $i18n({
  message: import.meta.glob('./locales/*.yml'),
  parseKey: path => path.slice(10, -5),
  // other options...
})
```
to convert yml, setup built-in vite plugin

vite.config.ts
```ts
import { defineConfig } from 'vite'
import { parse } from 'yaml'
import { I18nPlugin } from 'solid-dollar/plugin'

export default defineConfig({
  plugins: [
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

### `defineEmits`

util for child component event emitting, auto handle optional prop

```tsx
import { defineEmits } from 'solid-dollar/utils'

type Emits = {
  var: number
  update: [d1: string, d2?: string, d3?: string]
  optional?: { test: number }
}

type BaseProps = { num: number }

function Child(props: EmitProps<Emits, BaseProps>) {
  const { emit, $emit } = defineEmits<Emits>(props)

  // auto emit after value changing, inspird by `defineModel` in Vue
  const variable = $emit('var', 1)
  const handleClick = () => {
    variable.$(v => v + 1)

    // manully emit
    emit('update', `emit from child: ${props.num}`, 'second')
    emit('optional', { test: 1 })
  }
  return (
    <div>
      child:
      {props.num}
      <button onClick={handleClick}>+</button>
    </div>
  )
}
function Father() {
  const count = $('init')
  return (
    <Child
      num={count()}
      $update={console.log}
      $var={e => console.log('useEmits:', e)}
    />
  )
}
```

### `$model`

simple two-way binding directive for `<input>`, `<textare>`, `<select>`

```tsx
import { $ } from 'solid-dollar'

const msg = $('')

return <input type="text" use:$model={msg} />
```

#### typescript support

env.d.ts:
```ts
import { ModelDirective } from 'solid-dollar/utils'

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
    AutoImport({
      import: [...$autoImport(true/* directive only */)],
    }),
  ],
})
```

### `$tick`

vue-like next tick, reference from [solidjs-use](https://github.com/solidjs-use/solidjs-use/blob/main/packages/solid-to-vue/src/scheduler.ts)

### `$app`

Vue's `createApp` like initialization, works in both `.ts` and `.tsx`

```ts
import { $app } from 'solid-dollar/utils'
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

reference from [solid-utils](https://github.com/amoutonbrady/solid-utils#createapp)

### `$idb`

create function to generate `$()` like IndexedDB wrapper, using [idb-keyval](https://github.com/jakearchibald/idb-keyval)

no serializer, be caution when store `Proxy`

```ts
import { $idb } from 'solid-dollar/utils'

const foo = $idb('foo', 'default value')
console.log(foo()) // get value
foo.$('test') // set value
await foo.$del() // delete key
```

#### `$idbRecord`

reactive IndexedDB record list

```ts
import { $idbRecord } from 'solid-dollar/utils'

const record = $idbRecord<string, string>('image', { cache: new LRU(10) })

record.$('first', 'data:,') // set record
record.$('first') // set current key
record.$() // get current key
console.log(record()) // get current value
```

### `defineContext`

object style [createContextProvider](https://github.com/solidjs-community/solid-primitives/tree/main/packages/context#createcontextprovider)

if default value is not defined and use context outside provider, throw `Error` when DEV

```ts
import { defineContext } from 'solid-dollar/utils'

const { useDateContext, DateProvider } = defineContext(
  'date',
  () => new Date()
)

const { useDateContext, DateProvider } = defineContext(
  'date',
  (args: { date: string }) => new Date(args.date),
  { date: '2000-01-01' }
)
```

### `$signal`

signal object with preSet and postSet hooks

```ts
import { $signal, NORETURN, noReturn } from 'solid-dollar/utils'

const hooks = $('hello', {
  preSet: v => `${v} hooks`, // change the set value
  postSet: newV => console.log(newV)
})
// hello hooks
console.log(hooks.$source) // orignal Signal Array: [hooks, setHooks]

const logPreSetHooks = $(1, {
  // preSet: v => noReturn(() => console.log(v))
  preSet: (v) => {
    console.log(v)
    return NORETURN
  }
})
```

### `$ref`

`$()` like wrapper to make plain object props reactive

```ts
import { $ref } from 'solid-dollar/utils'

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

### `$listenEvent` / `$listenEventMap` / `$listenDocument` / `listenWindow`

aliases and shortcuts of [@solid-primitives/event-listener](https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-listener)