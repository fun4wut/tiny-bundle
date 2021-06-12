import { Program } from '@babel/types'
import * as fs from 'fs'
import { join, dirname } from 'path'
import { ModNode } from '../graph'

export function findPkg() {

}

function getExactName(path: string) {
    if (fs.existsSync(path)) {
        return path
    }
    if (fs.existsSync(`${path}.js`)) {
        return `${path}.js`
    }
    if (fs.existsSync(join(path, 'index.js'))) {
        return join(path, 'index.js')
    }
}

export function getImports(prog: Program, filePath: string) {
    const imports = new Array<string>()
    for (const stmt of prog.body) {
        if (stmt.type === 'ImportDeclaration') {
            const source = stmt.source.value
            if (source.startsWith('.')) { // 相对路径
                imports.push(getExactName(join(dirname(filePath), source)))
            } else { // npm package

            }
        }
    }
    return imports
}