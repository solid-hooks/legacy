import { readFileSync, writeFileSync } from 'node:fs'

const file = readFileSync('src/index.ts', 'utf-8')

const vars = []
const types = []

const varArray = file.matchAll(/export {(.*)} .*/g)
for (const e of varArray) {
  vars.push(...e[1].trim().split(',').map(v => v.trim()))
}
const typeArray = file.matchAll(/export type {(.*)} .*/g)
for (const e of typeArray) {
  types.push(...e[1].trim().split(',').map(v => v.trim()))
}

const result = [
  {
    from: 'solid-dollar',
    imports: vars,
  },
  {
    from: 'solid-dollar',
    imports: types,
    type: true,
  },
]

const code = readFileSync('src/plugin/auto-import.ts', 'utf-8')
const imports = JSON.stringify(result, null, 2)
const replacedCode = code.replace(/export const \$autoImport: ImportMap = \[[\S\s]*\]/gm, '')

writeFileSync('src/plugin/auto-import.ts', `${replacedCode}export const \$autoImport: ImportMap = ${imports}`)

console.log('finish update $autoImport')