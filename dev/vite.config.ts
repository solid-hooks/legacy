import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import { parse } from 'yaml'
import { $i18nPlugin } from '../src/plugin'

export default defineConfig({
  clearScreen: false,
  plugins: [
    solid(),
    // useful when using yml as locale message
    $i18nPlugin({
      include: './dev/i18n/locales/*.yml',
      transformMessage: content => parse(content),
      // include: 'dev/i18n/locales/*.tr',
      // transformMessage: content => JSON.parse(content),
      generateConfigYml: true,
    }),
  ],
})
