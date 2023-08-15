# solid-dollar

hooks for solid.js

## `$`/`$signal`

`createSignal` wrapper

```ts
const data = $(0)

console.log(data()) // 0

console.log(data.set(1)) // 1

console.log(data()) // 1

console.log(data.signal) // original signal
```

## `$store`

`createStore` wrapper, return `$()` like object

## `$state`

store support for persist, inspired by pinia & zustand

```tsx
const useStore = $state('test', {
  state: { test: 1 },
  getter: state => ({
    doubleValue() {
      return state.test * 2
    },
  }),
  action: set => ({
    double() {
      set('test', test => test * 2)
    },
    plus(num: number) {
      set('test', test => test + num)
    },
  }),
  persist: {
    enable: true,
    storage: localStorage,
    debug: true,
    path: ['test'] // type safe!
  },
})
const { state, double, plus, $patch, $reset, $subscribe } = useStore()
render(() => (
  <div>
    <p>{state().count}</p>
    <button onClick={double}>double</button>
    <button onClick={() => plus(2)}>plus 2</button>
  </div>
))
```

## `$watch`

pausable and filterable `createEffect`

```ts
const str = $('old')
const callback = console.log
const filter = (newValue: string, times: number) => {
  return newValue !== 'new'
}
const { isWatching, pause, resume } = $watch(str, callback, {
  callFn: throttle,
  filterFn: filter,
  defer: true,
})
```

## `$i18n`

simple i18n, support async load message file

### normal load

see in [`test/i18n.test.ts`](test/i18n.test.ts)

### async load

```ts
const { $t, availableLocales, locale } = $i18n({
  // message: import.meta.glob('./locales/*.json'),
  message: import.meta.glob('./locales/*.yml'),
  parseKey: path => path.slice(10, -4),
  defaultLocale: 'en',
})
$t('deep.t')
locale.set('zh-CN')
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

## `$idle`

`window.requestIdleCallback` wrapper with cleanup

fallback to `window.requestAnimationFrame` or execute it directly

## `model`

simple two-way binding for `<input>`, `<textare>`, `<select>`

```tsx
const msg = $('')

<input type="text" use:model={[msg]}>
```

use with [`unplugin-solid-directive`](https://github.com/subframe7536/unplugin-solid-directive)

tsconfig.json:
```json
{
  "compilerOptions": {
    // ...
    "types": [
      "solid-dollar/directive"
    ],
  }
}
```

vite.config.ts
```ts
import { defineConfig } from 'vite'
import Directive from 'unplugin-solid-directive/vite'

export default defineConfig({
  plugins: [
    // ...
    Directive({
      directives: [{ directive: 'model', module: 'solid-dollar' }],
    }),
  ],
})
```