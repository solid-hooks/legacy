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
console.log(data.$set(1)) // set value
```

#### `$$`

`untrack` alias

### `$memo`

object wrapper for `createMemo`

```ts
import { $, $memo } from 'solid-dollar'

const test = $('test')
const memo = $memo(() => `value: ${test()}`)
```

### `$store`

object wrapper for `createStore`

```ts
import { $store } from 'solid-dollar'

const store = $store({ test: { deep: 1 } })

store() // { test: { deep: 1 } }
store.$set('test', 'deep', 2) // set value
```

#### `$patchStore`

patch update store

```ts
import { $store, $patchStore } from 'solid-dollar'

const store = $store({ data: { deep: 1 } })
$patchStore(store, data => { data.deep = 2 })
$patchStore(store, { data: { deep: 3 } })
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

pausable and filterable `createEffect(on())`, defer by default

```ts
import { $watch } from 'solid-dollar'
import { throttle } from '@solid-primitives/scheduled'

const str = $('old')
function filter(newValue: string, times: number) {
  return newValue !== 'new'
}
function callback<T>(value: T, oldValue: T, callTimes: number) {
  console.log(value, oldValue, callTimes)
}
const {
  isWatching,
  pause,
  resume,
  runWithoutEffect,
} = $watch(str, callback, {
  // function for trigger callback
  triggerFn: fn => throttle(fn, 500),
  // function for filter value
  filterFn: filter,
  // createEffect `onOptions.defer`, default is true
  defer: false,
})
```

#### `$effect`

normal effect, alias for `createEffect`

#### `$watchRendered`

`$watch` but `createRenderEffect(on())`

#### `$effectRendered`

run effect after rendered, be able to access DOM, alias for `createRenderEffect`

#### `$watchInstant`

`$watch` but `createComputed(on())`

#### `$effectInstant`

run effect instantly, alias for `createComputed`

### `$deferred`

defer update notification until browser idle, alias for `createDeferred`

### `$selector`

object wrapper for `createSelector`

```tsx
import { For } from 'solid-js'
import { $selector } from 'solid-dollar'

const activeId = $selector(0)
activeId.$set(1)

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

### `$objectURL`

convert binary to object url

```ts
import { $objectURL } from 'solid-dollar'

const url = $objectURL(new Blob())
const url = $objectURL(new MediaSource())
const url = $objectURL(new Uint8Array(), { type: 'image/png' })
```

### `$patchArray`

patch update array signal

```ts
import { $, $patchArray } from 'solid-dollar'

const arr = $<number[]>([1])

arr() // [1]
$patchArray(arr, a => a.push(3)) // update by mutating it in-place
arr() // [1, 3]
```

### `$reactive`

make plain object props reactive

```ts
import { $reactive } from 'solid-dollar'

const value = {
  deep: {
    data: 'str',
  },
}

const bar = $reactive(value, 'deep.data')

bar() // 'str'
bar.$set('updated') // 'update'
bar() // 'updated'
```

---

## `solid-dollar/state`

### `$state`

global state with auto persistence

support run without provider (fallback to `createRoot`)

inspired by `pinia` & `zustand`

```tsx
import { $state, GlobalStateProvider, useGetters, useActions } from 'solid-dollar/state'

const useTestState = $state('test', {
  init: { value: 1, deep: { data: 'hello' } },
  getter: state => ({
    // without param, will auto wrapped with `createMemo`
    doubleValue() {
      return state.value * 2
    },
  }),
  action: stateObj => ({
    plus(num: number) {
      stateObj.$set('value', value => value + num)
    },
  }),
  persist: {
    enable: true,
    storage: localStorage,
    path: ['test'] // type safe, support array
  },
}, true) // set true to enable DEV log

// usage
const state = useTestState()
const getters = useTestState<'getter'>() // type only getter parser
const actions = useTestState<'action'>() // type only action parser

render(() => (
  <GlobalStateProvider> {/* optional */}
    state: <p>{state().value}</p>

    getter: <p>{state.doubleValue()}</p>
    getter: <p>{getters.doubleValue()}</p>

    action: <button onClick={state.double}>double</button>
    action: <button onClick={actions.double}>double</button>
    action: <button onClick={() => state.plus(2)}>plus 2</button>
  </GlobalStateProvider>
))

// use $patchStore
state.$patch((state) => {
  state.deep.data = 'patch'
})
state.$patch({
  test: 2
})

// $watch
const { pause, resume, isWatching } = state.$subscribe(
  s => s.deep.data
  state => console.log(state),
  { defer: false },
)

// reset
state.$reset()
```

or just a global-level context & provider

```ts
import { $, $instantEffect, $memo } from 'solid-dollar'
import { $state } from 'solid-dollar/state'

export const useCustomState = $state('custom', (name, log) => {
  const plain = $(1)
  $instantEffect(() => {
    log('$state with custom function:', { name, newValue: plain() })
  })
  const plus2 = $memo(plain() + 2) // recognized as 'getter' on type
  function add() { // recognized as 'action' on type
    plain.$set(p => p + 1)
  }
  return { plain, plus2, add }
})
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

#### static message

```tsx
import { For } from 'solid-js'
import { $i18n, useStaticMessage } from 'solid-dollar/i18n'

// use `as const` to make parameters typesafe
const zh = { t: '1', deep: { t: '{name}' }, plural: '{day}' } as const
const en = { t: '2', deep: { t: '{name}' }, plural: '{day}(0=zero|1=one)' } as const
export const { useI18n, I18nProvider } = $i18n({
  message: useStaticMessage({ 'en': en, 'zh-CN': zh }),
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
const { $t, $scopeT, $d, $n, availiableLocales, locale } = useI18n(/* optional typesafe scope */)
const scopeT = $scopeT('deep')

return (
  <I18nProvider>
    <select onChange={e => locale.$set(e.target.value)}>
      <For each={availiableLocales}>
        {l => <option selected={l === locale()}>{l}</option>}
      </For>
    </select>
    <div>{$t('t')}</div>
    <br />
    {/* typesafe parameters */}
    <div>{$t('t.deep', { name: 'test' })}</div>
    <div>{$t('plural', { day: 1 })}</div>
    <div>{$d(new Date())}</div>
    <div>{$d(new Date(), 'long')}</div>
    <div>{$d(new Date(), 'long', 'en')}</div>
    <div>{$n(100, 'currency')}</div>
  </I18nProvider>
)
```

#### dynamic message

using `import.meta.glob(...)` to dynamically load message

```tsx
import { $i18n, useDynamicMessage } from 'solid-dollar/i18n'

export const { useI18n, I18nProvider } = $i18n({
  message: useDynamicMessage(
    import.meta.glob('./locales/*.yml'),
    parseKey: path => path.slice(10, -4)
  ),
  // other options...
})

return (
  <I18nProvider useSuspense={<div>loading...</div>}>
    {/*...*/}
  </I18nProvider>
)
```

#### vite plugin

to convert yml, setup built-in vite plugin

vite.config.ts
```ts
import { defineConfig } from 'vite'
import { parse } from 'yaml'
import { $i18nPlugin } from 'solid-dollar/plugin'

export default defineConfig({
  plugins: [
    $i18nPlugin({
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

## `solid-dollar/hooks`

### `useEmits`

util for child component event emitting, auto handle optional prop

```tsx
import { useEmits } from 'solid-dollar/hooks'
import type { EmitProps } from 'solid-dollar/hooks'

type Emits = {
  var: number
  update: [d1: string, d2?: string, d3?: string]
  optional?: { test: number }
}

type BaseProps = { num: number }

function Child(props: EmitProps<Emits, BaseProps>) {
  const { emit, $emit } = useEmits<Emits>(props)

  // auto emit after value changing, inspird by `defineModel` in Vue
  const variable = $emit('var', 1)
  const handleClick = () => {
    variable.$set(v => v + 1)

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

### `model`

simple two-way binding directive for `<input>`, `<textare>`, `<select>`

```tsx
import { $ } from 'solid-dollar'

const msg = $('')

return <input type="text" use:model={msg} />
```

typescript support

env.d.ts:
```ts
import { ModelDirective } from 'solid-dollar/hooks'

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

### `useTick`

`Vue` like `nextTick()`, reference from [solidjs-use](https://github.com/solidjs-use/solidjs-use/blob/main/packages/solid-to-vue/src/scheduler.ts)

### `useApp`

`Vue` like `createApp()`

```ts
import { useApp } from 'solid-dollar/hooks'
import App from './App'

useApp(App)
  .use(RouterProvider, { props })
  .use(I18nProvider)
  .use(GlobalStoreProvider)
  .mount('#app')
```

is equal to:

```tsx
render(
  <RouterProvider props={props}>
    <I18nProvider>
      <GlobalStoreProvider>
        <App />
      </GlobalStoreProvider>
    </I18nProvider>
  </RouterProvider>,
  document.querySelector('#app')
)
```

reference from [solid-utils](https://github.com/amoutonbrady/solid-utils#createapp)

### `useContextProvider`

object style useContext and Provider

if default value is not defined and use context outside provider, throw `Error` when DEV

reference from [@solid-primitives/context](https://github.com/solidjs-community/solid-primitives/tree/main/packages/context#createcontextprovider)

```ts
import { useContextProvider } from 'solid-dollar/hooks'

const { useDateContext, DateProvider } = useContextProvider(
  'date',
  () => new Date()
)

// use parameters
const { useDateContext, DateProvider } = useContextProvider(
  'date',
  (args: { date: string }) => new Date(args.date),
  { date: '2000-01-01' }
)
```

### `useEventListener` / `useEventListenerMap` / `useDocumentListener` / `useWindowListener`

auto cleanup event listener

reference from [@solid-primitives/event-listener](https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-listener)

### `useDraggable`

make element draggable

```tsx
import { $ } from 'solid-dollar'
import { useDraggable } from 'solid-dollar/hooks'

const el = $<HTMLElement>()
const handle = $<HTMLElement>()

const {
  position,
  resetPosition,
  enable,
  disable,
  isDragging,
  isDraggable,
  style,
} = useDraggable(el, {
  initialPosition: { x: 200, y: 80 },
  addStyle: true, // auto add style on el
  handleEl: handle,
})
return (
  <div
    ref={el.$}
    style={{ position: 'fixed' }}
  >
    I am at {Math.round(position().x)}, {Math.round(position().y)}
    <div
      ref={handle.$}
      style={{ position: 'fixed' }}
    >
    drag me
    </div>
  </div>
)
```

### load resources

#### `useScriptLoader`

load external script / style

```ts
import { $ } from 'solid-dollar'
import { useScriptLoader } from 'solid-dollar/hooks'

const script = $('console.log(`test load script`)')
const { element, cleanup } = useScriptLoader(script, {/* options */})
```

#### `useStyleLoader`

load external CSS code

```ts
import { useStyleLoader } from 'solid-dollar/hooks'

const { element, cleanup } = useStyleLoader('.card{color:#666}', {/* options */})
```

### `useCallback`

create callbacks with `runWithOwner`, auto get current owner

reference from [@solid-primitives/rootless](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createcallback)

```ts
import { $watch } from 'solid-dollar'
import { useCallback } from 'solid-dollar/hooks'

const handleClick = useCallback(() => {
  $watch(() => {...})
})
setTimeOut(handleClick, 100)
```

### `usePersist`

auto persist value to storage(sync or async)

reference from [@solid-primitives/storage](https://github.com/solidjs-community/solid-primitives/tree/main/packages/storage)

```ts
import { $, $store } from 'solid-dollar'
import { usePersist } from 'solid-dollar/hooks'

// default to persist to `localeStorage`
const val = usePersist('key', $(1))

const itemState = usePersist('item', { test: 'loading' }, {
  storage: {/* async or sync storage */}
  serializer: {
    read: JSON.parse, // default
    write: JSON.stringify, // default
  }
})
```