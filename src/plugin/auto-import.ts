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
    'from': 'solid-dollar/hooks',
    'imports': [
      'model'
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
      '$watchInstant',
      '$watchRendered',
      '$selector',
      '$$',
      '$effect',
      '$effectInstant',
      '$effectRendered',
      '$deferred',
      '$array',
      '$objectURL',
      '$reactive'
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
      'SelectorObjectOptions',
      'ArrayObject',
      'ObjectURLObject',
      'ReactiveObject'
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
    'from': 'solid-dollar/hooks',
    'imports': [
      'model',
      'useContextProvider',
      'useTick',
      'useApp',
      'useEmits',
      'useDocumentListener',
      'useWindowListener',
      'useEventListener',
      'useEventListenerMap',
      'useDraggable',
      'clamp',
      'useScriptLoader',
      'useStyleLoader',
      'useCallback',
      'usePersist'
    ]
  },
  {
    'from': 'solid-dollar/hooks',
    'imports': [
      'ModelDirective',
      'ContextObject',
      'EmitProps',
      'EmitsObject',
      'DragOptions',
      'DraggableElement',
      'ScriptOptions',
      'StyleOption',
      'PeresistOptions'
    ],
    'type': true
  }
]