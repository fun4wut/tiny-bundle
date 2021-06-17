import find from 'find-package-json'
import * as path from 'path'
import { Graph } from './graph'
import ast, { Program, Statement } from '@babel/types'
import generate from '@babel/generator'
import { SymTbl } from './symbol'
import { IContext } from './traverse/types'
import { doTraverse } from './traverse'
import { writeFileSync } from 'fs'

export class Bundler {
    constructor(private initialEntry: string) {
        this.pkgRoot = find(this.initialEntry).next().value
    }
    private graph = new Graph()
    private symTbl = new SymTbl()
    private pkgRoot: find.PackageWithPath
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
        this.graph.addEdges({
            path: filePath,
            depStr: imports,
            prog: ctx.body
        })
        return imports
    }
    
    private collectDependency = (entry: string) => {
        if (this.graph.containsNode(entry)) {
            return
        }
        const imports = this.traverseFile(entry)
        console.log(`${entry}'s deps collected`)
        imports.forEach(this.collectDependency)
    }

    genDependencyArr() {
        this.collectDependency(this.initialEntry)
        return this.graph.topSort()
    }
    
    dump(p: string) {
        const sortedAST = this.genDependencyArr().flatMap(v => v.prog)
        const str = generate(ast.program(sortedAST)).code
        writeFileSync(p, str)
    }
}

const fileName = 'test/index.js' ?? process.argv[1]

const initialEntry = path.join(process.cwd(), fileName)

const bundler = new Bundler(initialEntry)

bundler.dump('test/tmp1.mjs')
