import * as JSParser from '@babel/parser'
import { Program } from '@babel/types'
import { readFileSync } from 'fs'
import * as path from 'path'
import { getExactName } from './utils/file'


export class Bundler {
    getImports = (prog: Program, filePath: string) => {
        const imports = new Array<string>()
        for (const stmt of prog.body) {
            if (stmt.type === 'ImportDeclaration') {
                const source = stmt.source.value
                if (source.startsWith('.')) { // 相对路径
                    imports.push(getExactName(path.join(path.dirname(filePath), source)))
                } else { // npm package
    
                }
            }
        }
        return imports
    }
    private _collectDependency = (entry: string, cur: Set<string>) => {
        cur.add(entry)
        const res = JSParser.parse(readFileSync(entry).toString(), {
            sourceType: "module"
        })
        const imports = this.getImports(res.program, entry)
        imports.forEach(imp => this._collectDependency(imp, cur))
    }

    collectDependency = (initialEntry: string) => {
        const cur = new Set<string>()
        this._collectDependency(initialEntry, cur)
        return cur
    }
}

const fileName = 'test/index.js' ?? process.argv[1]

const initialEntry = path.join(process.cwd(), fileName)

console.log(new Bundler().collectDependency(initialEntry))