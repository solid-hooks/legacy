import { defineEslintConfig } from '@subframe7536/eslint-config'

export default defineEslintConfig({
  type: 'solid',
  rulesOverrideAll: {
    'solid/jsx-no-undef': 'off',
  },
})
