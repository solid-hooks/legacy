import { $i18n } from '../../src/i18n'

export const { $t, availiableLocales, locale } = $i18n({
  // message: import.meta.glob('./locales/*.tr'),
  // parseKey: path => path.slice(10, -3),
  message: import.meta.glob('./locales/*.yml'),
  parseKey: path => path.slice(10, -5),
})