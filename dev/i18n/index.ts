import { $i18nContext } from '../../src/i18n'

export const { I18nProvider, useI18n } = $i18nContext({
  // message: import.meta.glob('./locales/*.tr'),
  // parseKey: path => path.slice(10, -3),
  message: import.meta.glob('./locales/*.yml'),
  parseKey: path => path.slice(10, -4),
  datetimeFormats: {
    'en': {
      short: { dateStyle: 'short' },
      long: { dateStyle: 'long' },
    },
    'zh-CN': {
      short: { dateStyle: 'short' },
      long: { dateStyle: 'full' },
    },
  },
  numberFormats: {
    'en': {
      currency: { style: 'currency', currency: 'USD' },
    },
    'zh-CN': {
      currency: { style: 'currency', currency: 'CNY' },
    },
  },
})
