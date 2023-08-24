import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { createFilter } from 'vite'
import type { FilterPattern, Plugin } from 'vite'

export interface I18nPluginOptions {
  /**
   * message files path include pattern
   * @example 'locales/*.yml'
   */
  include: FilterPattern
  /**
   * message files path exclude pattern
   */
  exclude?: FilterPattern
  /**
   * raw message transform functions
   * @param content matched message file content
   * @param id matched message file path
   */
  transformMessage: (content: string, id: string) => any
  /**
   * whether to generate yml for {@link https://github.com/lokalise/i18n-ally/wiki/Custom-Framework i18n-ally plugin}
   */
  generateConfigYml?: boolean
}

function generateYml() {
  const yml = `# auto generate by solid $i18n plugin
# more config: https://github.com/lokalise/i18n-ally/wiki/Custom-Framework
languageIds:
- javascript
- typescript
- javascriptreact
- typescriptreact
usageMatchRegex:
- "[^\\\\w\\\\d]t\\(['\\\\"\`]({key})['\\\\"\`]"
monopoly: true`.replace(/\r\n?/g, '\n')
  if (!existsSync('.vscode')) {
    mkdirSync('.vscode')
  }

  const ymlPath = '.vscode/i18n-ally-custom-framework.yml'
  if (!existsSync(ymlPath)) {
    writeFileSync(ymlPath, yml, 'utf-8')
  }
}

export function I18nPlugin(option: I18nPluginOptions): Plugin {
  const { include, exclude, generateConfigYml, transformMessage } = option

  if (generateConfigYml) {
    generateYml()
  }

  const filter = createFilter(include, exclude)
  return {
    name: 'vite-solid-$i18n',
    transform(code, id) {
      if (filter(id)) {
        const msg = transformMessage(code, id)
        return `export default ${JSON.stringify(msg)}`
      }
    },
  }
}
