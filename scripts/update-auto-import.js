import { readFileSync, writeFileSync } from 'node:fs'
import ts from 'typescript'

const file = readFileSync('src/index.ts', 'utf-8')

function getExports(code) {
  const sourceFile = ts.createSourceFile('temp.ts', code, ts.ScriptTarget.Latest, true)

  const list = {
    types: [],
    vars: [],
  }

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isExportDeclaration(node)) {
      const exported = node.exportClause.elements

      exported.forEach((exp) => {
        if (ts.isTypeOnlyExportDeclaration(exp)) {
          list.types.push(exp.name.text)
        } else {
          list.vars.push(exp.name.text)
        }
      })
    }
  })

  return list
}
const { vars, types } = getExports(file)
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
const directiveOnly = JSON.stringify([{ from: 'solid-dollar', imports: ['$model'] }], null, 2)
const replacedCode = code.replace(/export const \$autoImport: ImportFn = [\s\S]*/gm, '')

writeFileSync(
  'src/plugin/auto-import.ts',
  `${replacedCode}export const \$autoImport: ImportFn = d => d ? ${directiveOnly} : ${imports}`,
)

console.log('update $autoImport')