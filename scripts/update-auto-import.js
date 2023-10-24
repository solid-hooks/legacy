import { readFileSync, writeFileSync } from 'node:fs'
import ts from 'typescript'

function getExports(filePath) {
  const code = readFileSync(filePath, 'utf-8')
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
    } else if (ts.isExportSpecifier(node)) {
      list.vars.push(node.name.text)
    }
  })

  return list
}
const index = getExports('src/index.ts')
const i18n = getExports('src/i18n/index.ts')
const state = getExports('src/state/index.ts')
const hooks = getExports('src/hooks/index.ts')
const result = [
  {
    from: 'solid-dollar',
    imports: index.vars,
  },
  {
    from: 'solid-dollar',
    imports: index.types,
    type: true,
  },
  {
    from: 'solid-dollar/i18n',
    imports: i18n.vars,
  },
  {
    from: 'solid-dollar/i18n',
    imports: i18n.types,
    type: true,
  },
  {
    from: 'solid-dollar/state',
    imports: state.vars,
  },
  {
    from: 'solid-dollar/state',
    imports: state.types,
    type: true,
  },
  {
    from: 'solid-dollar/hooks',
    imports: hooks.vars,
  },
  {
    from: 'solid-dollar/hooks',
    imports: hooks.types,
    type: true,
  },
]
const code = readFileSync('src/plugin/auto-import.ts', 'utf-8')
const imports = JSON.stringify(result, null, 2)
const directiveOnly = JSON.stringify([{ from: 'solid-dollar/hooks', imports: ['model'] }], null, 2)
const replacedCode = code.replace(/export const \$autoImport: ImportFn = [\s\S]*/gm, '')

writeFileSync(
  'src/plugin/auto-import.ts',
  `${replacedCode}export const \$autoImport: ImportFn = directiveOnly => directiveOnly ? ${directiveOnly} : ${imports}`.replace(/"/g, '\''),
)

console.log('update $autoImport')
