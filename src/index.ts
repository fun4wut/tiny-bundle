import * as JSParser from '@babel/parser'
import { readFileSync } from 'fs'
import find from 'find-package-json'
import * as path from 'path'
import { getExactName, getExactNpm } from './utils/file'
import { Graph } from './graph'
import ast, { Program, Statement } from '@babel/types'


export class Bundler {
    constructor(private initialEntry: string) {}
    private graph = new Graph()
    private pkgRoot = find(this.initialEntry).next().value
    private body: Array<Statement>
    private getImports(prog: Program, filePath: string) {
        const imports = new Array<string>()
        for (const stmt of prog.body) {
            if (stmt.type === 'ImportDeclaration' || stmt.type === 'ExportNamedDeclaration') {
                if (!stmt.source) {
                    continue
                }
                const source = stmt.source.value
                if (source.startsWith('.')) { // 相对路径
                    imports.push(getExactName(path.join(path.dirname(filePath), source)))
                } else { // npm package
                    imports.push(getExactNpm(path.join(this.pkgRoot.__path, '../node_modules', source)))
                }
            }

        }
        return imports
    }
    
    private collectDependency = (entry: string) => {
        if (this.graph.containsNode(entry)) {
            return
        }
        const res = JSParser.parse(readFileSync(entry).toString(), {
            sourceType: "module"
        })
        const imports = this.getImports(res.program, entry)
        this.graph.addEdges({
            path: entry,
            depStr: imports
        })
        console.log(`${entry}'s deps collected`)
        imports.forEach(this.collectDependency)
    }

    genDependencyArr() {
        this.collectDependency(this.initialEntry)
        return this.graph.topSort()
    }

    processSingleFile() {
        
    }
}

const fileName = 'test/index.js' ?? process.argv[1]

const initialEntry = path.join(process.cwd(), fileName)

const bundler = new Bundler(initialEntry)

console.log(bundler.genDependencyArr())
