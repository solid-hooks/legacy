import { $i18nContext, useDynamicMessage } from '../../src/i18n'

export const { useI18n, I18nProvider } = $i18nContext({
  // message: import.meta.glob('./locales/*.tr'),
  // parseKey: path => path.slice(10, -3),
  message: useDynamicMessage(
    import.meta.glob('./locales/*.yml'),
    path => path.slice(10, -4),
  ),
  datetimeFormats: {
    'en': {
      short: { dateStyle: 'short' },
      long: { dateStyle: 'long' },
      custom: d => d.getTime().toString(),
    },
    'zh-CN': {
      short: { dateStyle: 'short' },
      long: { dateStyle: 'full' },
      custom: d => d.getTime().toString(),
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
