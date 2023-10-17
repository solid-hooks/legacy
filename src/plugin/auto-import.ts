/* eslint-disable style/eol-last */
/* eslint-disable style/comma-dangle */
/* eslint-disable style/quote-props */
/* eslint-disable style/multiline-ternary */

type ImportMap = {
  from: string
  imports: string[]
  type?: boolean
}[]
type ImportFn = (directiveOnly: boolean) => ImportMap
/**
 * adapter for unplugin-auto-import
 * @param directiveOnly whether to only import directive
 * @example
 * ```ts
 * import AutoImport from 'unplugin-auto-import/vite'
 * import { $autoImport } from 'solid-dollar/plugin'
 * export default defineConfig({
 *   plugins: [
 *     AutoImport({
 *       import: ['solid-js', ...$autoImport(false)],
 *     }),
 *   ],
 * })
 * ```
 */
export const $autoImport: ImportFn = directiveOnly => directiveOnly ? [
  {
    'from': 'solid-dollar/utils',
    'imports': [
      '$model'
    ]
  }
] : [
  {
    'from': 'solid-dollar',
    'imports': [
      '$',
      'isSignal',
      '$memo',
      '$resource',
      '$store',
      '$trackStore',
      '$watch',
      '$watchOnce',
      '$selector',
      '$$',
      '$effect',
      '$instantEffect',
      '$renderEffect',
      '$deferred'
    ]
  },
  {
    'from': 'solid-dollar',
    'imports': [
      'SignalObject',
      'MemoObject',
      'ResourceObject',
      'InitializedResourceObject',
      'StoreObject',
      'WatchCallback',
      'WatchOptions',
      'WatchObject',
      'SelectorObject',
      'SelectorObjectOptions'
    ],
    'type': true
  },
  {
    'from': 'solid-dollar/i18n',
    'imports': [
      '$i18n',
      'I18nProvider'
    ]
  },
  {
    'from': 'solid-dollar/i18n',
    'imports': [
      'I18nOptions',
      'I18nObject',
      'NumberFormats',
      'DateTimeFormats'
    ],
    'type': true
  },
  {
    'from': 'solid-dollar/state',
    'imports': [
      '$state',
      'GlobalStateProvider',
      'deepClone'
    ]
  },
  {
    'from': 'solid-dollar/state',
    'imports': [
      'InitialState',
      'PersistOptions',
      'StateSetup',
      'StateObject',
      'StorageLike',
      'StateListener'
    ],
    'type': true
  },
  {
    'from': 'solid-dollar/utils',
    'imports': [
      '$model',
      'defineContext',
      '$tick',
      '$app',
      'defineEmits',
      '$reactive',
      '$listenDocument',
      '$listenWindow',
      '$listenEvent',
      '$listenEventMap',
      '$persist'
    ]
  },
  {
    'from': 'solid-dollar/utils',
    'imports': [
      'ModelDirective',
      'ContextObject',
      'EmitProps',
      'EmitsObject',
      'ReactiveObject',
      'PeresistOptions'
    ],
    'type': true
  }
]