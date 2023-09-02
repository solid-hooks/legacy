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
        from: 'solid-dollar',
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
          '$$',
          '$array',
          '$memo',
          '$res',
          '$state',
          '$store',
          '$trackStore',
          'deepClone',
          '$watch',
          '$i18n',
          '$idle',
          '$model',
          '$cx',
          '$tick',
          '$runWithOwner',
          '$idb',
          '$app',
        ],
      },
      {
        from: 'solid-dollar',
        imports: [
          'SignalObject',
          'MemoObject',
          'ResourceObject',
          'InitializedResourceObject',
          'PersistOption',
          'StateSetup',
          'StateObject',
          'StoreObject',
          'StorageLike',
          'SubscribeCallback',
          'WatchCallback',
          'WatchOption',
          'I18nOption',
          'I18nContext',
          'NumberFormats',
          'DateTimeFormats',
          'ModelParam',
          'ModelElement',
          'ModelDirective',
        ],
        type: true,
      },
    ]