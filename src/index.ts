import * as JSParser from '@babel/parser'
import traverse from '@babel/traverse'
import { readFileSync } from 'fs'
import find from 'find-package-json'
import * as path from 'path'
import { Graph } from './graph'
import ast, { Program, Statement } from '@babel/types'
import { SymTbl } from './symbol'
import { ImportsPlugin } from './traverse/imports'
import { IContext } from './traverse/types'
import { doTraverse } from './traverse'

export class Bundler {
    constructor(private initialEntry: string) {
        this.pkgRoot = find(this.initialEntry).next().value
    }
    private graph = new Graph()
    private symTbl = new SymTbl()
    private pkgRoot: find.PackageWithPath
    private body: Array<Statement>
    private traverseFile(filePath: string) {
        const imports = new Array<string>()
        const bodyPart = new Array<Statement>()
        const ctx: IContext = {
            importsArr: imports,
            filePath,
            pkgPath: this.pkgRoot.__path,
            body: bodyPart,
            isSpecialStmt: false,
            symTbl: this.symTbl
        }
        doTraverse(ctx)
        return imports
    }
    
    private collectDependency = (entry: string) => {
        if (this.graph.containsNode(entry)) {
            return
        }
        const imports = this.traverseFile(entry)
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
