import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import { parse } from 'yaml'
import { I18nPlugin } from '../src/plugin'

export default defineConfig({
  clearScreen: false,
  plugins: [
    solid(),
    // useful when using yml as locale message
    I18nPlugin({
      include: 'dev/i18n/locales/*.yml',
      transformMessage: content => parse(content),
      // include: 'dev/i18n/locales/*.tr',
      // transformMessage: content => JSON.parse(content),
    }),
  ],
})
