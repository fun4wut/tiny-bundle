import * as JSParser from '@babel/parser'
import { readFileSync } from 'fs'
import find from 'find-package-json'
import * as path from 'path'
import { Graph } from './graph'
import ast, { Program, Statement } from '@babel/types'
import { SymTbl } from './symbol'
import { ImportsPlugin } from './traverse/imports'
import { DeclPlugin } from './traverse/decl'
import { IContext } from './traverse/types'
import { Traverser } from './traverse'


export class Bundler {
    constructor(private initialEntry: string) {
        this.traverser
            .use(ImportsPlugin)
            .use(DeclPlugin)
    }
    private graph = new Graph()
    private symTbl = new SymTbl()
    private traverser = new Traverser()
    private pkgRoot = find(this.initialEntry).next().value
    private body: Array<Statement>
    private getImports(prog: Program, filePath: string) {
        const imports = new Array<string>()
        for (const stmt of prog.body) {
            const ctx: IContext = {
                importsArr: imports,
                filePath,
                pkgPath: this.pkgRoot.__path,
                stmt
            }
            const fn = this.traverser.compose()
            fn(ctx, () => console.log('traverse done'))
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
}

const fileName = 'test/index.js' ?? process.argv[1]

const initialEntry = path.join(process.cwd(), fileName)

const bundler = new Bundler(initialEntry)

console.log(bundler.genDependencyArr())
