import { defineConfig } from 'tsup'
import * as preset from 'tsup-preset-solid'

const preset_options: preset.PresetOptions = {
  entries: [
    {
      entry: 'src/index.ts',
    },
    {
      entry: 'src/plugin/index.ts',
      name: 'plugin',
    },
    {
      entry: 'src/i18n/index.ts',
      name: 'i18n',
    },
    {
      entry: 'src/state/index.ts',
      name: 'state',
    },
    {
      entry: 'src/utils/index.ts',
      name: 'utils',
    },
  ],
  cjs: true,
  modify_esbuild_options(option) {
    option.platform = 'node'
    option.external = ['vite', 'solid-js']
    return option
  },
}

const CI
  = process.env.CI === 'true'
  || process.env.GITHUB_ACTIONS === 'true'
  || process.env.CI === '"1"'
  || process.env.GITHUB_ACTIONS === '"1"'

export default defineConfig((config) => {
  const watching = !!config.watch

  const parsed_options = preset.parsePresetOptions(preset_options, watching)

  if (!watching && !CI) {
    const package_fields = preset.generatePackageExports(parsed_options)

    package_fields.exports['./i18n/utils'] = {
      import: {
        types: './dist/i18n/utils.d.ts',
        default: './dist/i18n/utils.js',
      },
      require: {
        types: './dist/i18n/utils.d.cts',
        default: './dist/i18n/utils.cjs',
      },
    }

    // @ts-expect-error setup type
    package_fields.typesVersions['*']['i18n/utils'] = ['./dist/i18n/utils.d.ts']

    console.log(`package.json: \n\n${JSON.stringify(package_fields, null, 2)}\n\n`)

    preset.writePackageJson(package_fields)
  }

  const prod = preset.generateTsupOptions(parsed_options)[0]!
  // @ts-expect-error setup i18n utils
  prod.entry['i18n/utils'] = './src/i18n/utils.ts'
  prod.plugins ??= []
  prod.plugins.push({
    name: 'undefined to void 0',
    renderChunk(code) {
      return {
        code: code.replaceAll('undefined', 'void 0'),
      }
    },
  })
  return prod
})
