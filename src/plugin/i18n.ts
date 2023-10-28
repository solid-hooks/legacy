import { join, relative } from 'node:path/posix'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { createFilter, createLogger, normalizePath } from 'vite'
import type { FilterPattern, Plugin } from 'vite'

export interface I18nPluginOptions {
  /**
   * message files path include pattern
   * @example './src/i18n/locales/*.yml'
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
   * whether to generate config yml for {@link https://github.com/lokalise/i18n-ally/wiki/Custom-Framework VSCode i18n Ally plugin}
   *
   * if type is string, generate the file to target **dir**
   */
  generateConfigYml?: boolean | string
}

function generateYml(basePath = '') {
  const yml = `# auto generate by solid $i18n plugin
# more config: https://github.com/lokalise/i18n-ally/wiki/Custom-Framework
languageIds:
  - javascript
  - typescript
  - javascriptreact
  - typescriptreact
usageMatchRegex:
  - '[^\\w\\d]t\\([''"\`]({key})[''"\`]'
monopoly: true
`.replace(/\r\n?/g, '\n')

  const base = join(basePath, '.vscode')
  if (!existsSync(base)) {
    mkdirSync(base)
  }

  const ymlPath = join(base, 'i18n-ally-custom-framework.yml')
  if (!existsSync(ymlPath)) {
    writeFileSync(ymlPath, yml, 'utf-8')
  }
}

export function $i18nPlugin(options: I18nPluginOptions): Plugin {
  const { include, exclude, generateConfigYml, transformMessage } = options

  if (generateConfigYml) {
    generateYml(typeof generateConfigYml === 'string' ? generateConfigYml : undefined)
  }

  const logger = createLogger('info', { prefix: '[$i18n]' })
  const filter = createFilter(include, exclude)
  const cwd = normalizePath(process.cwd())
  return {
    name: 'vite-solid-$i18n',
    transform(code, id) {
      if (filter(id)) {
        const msg = transformMessage(code, id)
        logger.info(`transform from ${relative(cwd, id)}`, { timestamp: true })
        return `export default ${JSON.stringify(msg)}`
      }
    },
  }
}
