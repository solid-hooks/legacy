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
          'WatchOptions',
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
          'deepClone',
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
          '$idle',
          '$model',
          '$cx',
          '$ctx',
          '$tick',
          '$runWithOwner',
          '$idb',
          '$app',
          '$emits',
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
          'EmitProps',
          'EmitsObject',
        ],
        type: true,
      },
    ]