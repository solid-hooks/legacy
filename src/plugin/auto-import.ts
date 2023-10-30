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
      '$patchStore',
      '$watch',
      '$watchOnce',
      '$watchInstant',
      '$watchRendered',
      '$selector',
      '$patchArray',
      '$objectURL',
      '$reactive',
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
      'WatchObject',
      'WatchOptions',
      'WatchOnceCallback',
      'SelectorObject',
      'SelectorObjectOptions',
      'ObjectURLObject'
    ],
    'type': true
  },
  {
    'from': 'solid-dollar/i18n',
    'imports': [
      '$i18n',
      'defineI18n',
      'useDynamicMessage',
      'useStaticMessage'
    ]
  },
  {
    'from': 'solid-dollar/i18n',
    'imports': [
      'I18nOptions',
      'I18nObject',
      'NumberFormats',
      'DateTimeFormats',
      'GenerateMessageFn'
    ],
    'type': true
  },
  {
    'from': 'solid-dollar/state',
    'imports': [
      '$state',
      'GlobalStateProvider',
      'defineState',
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
      'useEventListener',
      'useEventListenerMap',
      'useDocumentListener',
      'useWindowListener',
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