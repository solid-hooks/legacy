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
          '$$',
          'NORETURN',
          'noReturn',
          '$memo',
          '$res',
          '$store',
          '$trackStore',
          '$watch',
        ],
      },
      {
        from: 'solid-dollar',
        imports: [
          'SignalObject',
          'MemoObject',
          'ResourceObject',
          'InitializedResourceObject',
          'StoreObject',
          'WatchCallback',
          'WatchOption',
        ],
        type: true,
      },
      {
        from: 'solid-dollar/i18n',
        imports: [
          '$i18n',
        ],
      },
      {
        from: 'solid-dollar/i18n',
        imports: [
          'I18nOption',
          'I18nContext',
          'NumberFormats',
          'DateTimeFormats',
        ],
        type: true,
      },
      {
        from: 'solid-dollar/state',
        imports: [
          '$state',
          'deepClone',
        ],
      },
      {
        from: 'solid-dollar/state',
        imports: [
          'PersistOption',
          'StateSetup',
          'StateObject',
          'StorageLike',
          'SubscribeCallback',
        ],
        type: true,
      },
      {
        from: 'solid-dollar/utils',
        imports: [
          '$idle',
          '$model',
          '$cx',
          '$tick',
          '$runWithOwner',
          '$idb',
          '$app',
          '$emits',
          'useEmits',
          '$noThrow',
          'NormalizedError',
          'isNormalizedError',
          'toNormalizedError',
        ],
      },
      {
        from: 'solid-dollar/utils',
        imports: [
          'ModelParam',
          'ModelDirective',
          'EmitFunctions',
          'Emits',
        ],
        type: true,
      },
    ]