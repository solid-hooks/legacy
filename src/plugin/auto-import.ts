type ImportMap = {
  from: string
  imports: string[]
  type?: boolean
}[]

/**
 * adapter for unplugin-auto-import
 *
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
 *       import: ['solid-js', ...$autoImport],
 *     }),
 *   ],
 * })
 * ```
 */
export const $autoImport: ImportMap = [
  {
    from: 'solid-dollar',
    imports: [
      '$',
      '$$',
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