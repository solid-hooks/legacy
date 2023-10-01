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
 *   // ...
 *   plugins: [
 *     // ...
 *     AutoImport({
 *       // ...
 *       import: ['solid-js', ...$autoImport(false)],
 *     }),
 *   ],
 * })
 * ```
 */
export const $autoImport: ImportFn = d => d
  ? [
      {
        from: 'solid-dollar/utils',
        imports: [
          '$model',
        ],
      },
    ]
  : [
      {
        from: 'solid-dollar',
        imports: [
          '$',
          'NORETURN',
          'noReturn',
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
          '$deferred',
        ],
      },
      {
        from: 'solid-dollar',
        imports: [
          'SignalObject',
          'SignalObjectOptions',
          'MemoObject',
          'ResourceObject',
          'InitializedResourceObject',
          'StoreObject',
          'WatchCallback',
          'WatchOptions',
          'WatchObject',
          'SelectorObject',
          'SelectorObjectOptions',
        ],
        type: true,
      },
      {
        from: 'solid-dollar/i18n',
        imports: [
          '$i18n',
          'I18nProvider',
        ],
      },
      {
        from: 'solid-dollar/i18n',
        imports: [
          'I18nOptions',
          'I18nObject',
          'NumberFormats',
          'DateTimeFormats',
        ],
        type: true,
      },
      {
        from: 'solid-dollar/state',
        imports: [
          '$state',
          'StateProvider',
        ],
      },
      {
        from: 'solid-dollar/state',
        imports: [
          'InitialState',
          'PersistOption',
          'StateSetup',
          'StateObject',
          'StorageLike',
          'StateListener',
        ],
        type: true,
      },
      {
        from: 'solid-dollar/utils',
        imports: [
          '$idleCallback',
          '$model',
          '$cx',
          '$ctx',
          '$tick',
          '$runWithOwner',
          '$idb',
          '$app',
          '$emits',
          '$ref',
        ],
      },
      {
        from: 'solid-dollar/utils',
        imports: [
          'ModelParam',
          'ModelDirective',
          'ContextObject',
          'IDBObject',
          'IDBOptions',
          'EmitProps',
          'EmitsObject',
          'RefObject',
        ],
        type: true,
      },
    ]