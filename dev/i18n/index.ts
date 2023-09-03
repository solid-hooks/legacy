import { $i18n } from '../../src/i18n'

export const useI18n = $i18n({
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
      long: { dateStyle: 'long' },
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
