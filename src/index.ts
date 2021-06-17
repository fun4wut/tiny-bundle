import find from 'find-package-json'
import JSParser from '@babel/parser'
import { join, dirname } from 'path'
import { Graph, ModNode } from './graph'
import ast, { Program, Statement } from '@babel/types'
import generate from '@babel/generator'
import { SymTbl } from './symbol'
import { IContext } from './traverse/types'
import { doTraverse } from './traverse'
import { writeFileSync, readFileSync } from 'fs'
import { getBaseName, getExactName, getExactNpm, getRelPath } from './utils/file'

export class Bundler {
    constructor(private initialEntry: string) {
        this.pkgRoot = find(this.initialEntry).next().value
    }
    private graph = new Graph()
    private symTbl = new SymTbl()
    private pkgRoot: find.PackageWithPath

    private getImports(filePath: string): ModNode {
        const importsArr = []
        const res = JSParser.parse(readFileSync(filePath).toString(), {
            sourceType: "module"
        })
        for (const stmt of res.program.body) {
            switch (stmt.type) {
                case 'ImportDeclaration':
                case 'ExportNamedDeclaration':
                    if (!stmt.source) { // 必须是 import from
                        continue
                    }
                    const source = stmt.source.value
                    if (source.startsWith('.')) { // 相对路径
                        importsArr.push(getExactName(join(dirname(filePath), source)))
                    } else { // npm package
                        importsArr.push(getExactNpm(join(this.pkgRoot.__path, '../node_modules', source)))
                    }
                    break
                case 'ExportDefaultDeclaration':
                    const varName = `${getBaseName(source)}_default`
                    this.symTbl.addSymbol(varName) // 先直接加入符号表中，避免换名字
                default:
                    break
            }


        }
        return {
            path: filePath,
            relPath: getRelPath(filePath, this.pkgRoot.__path),
            depStr: importsArr,
            prog: res.program.body,
        }
    }

    private traverseAST(mod: ModNode) {
        const ctx: IContext = {
            filePath: mod.path,
            pkgPath: this.pkgRoot.__path,
            body: mod.prog,
            symTbl: this.symTbl,
            mod
        }
        doTraverse(ctx)

    }
    
    private collectDependency = (entry: string) => {
        if (this.graph.containsNode(entry)) {
            return
        }
        const mod = this.getImports(entry)
        this.graph.addEdges(mod)
        // console.log(`${entry}'s deps collected`)
        mod.depStr.forEach(this.collectDependency)
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

const initialEntry = join(process.cwd(), fileName)

const bundler = new Bundler(initialEntry)

bundler.dump('test/tmp1.mjs')
