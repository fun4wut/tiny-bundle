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
import { convertPath, getBaseName, getExactName, getExactNpm, getRelPath } from './utils/file'

export class Bundler {
    constructor(private initialEntry: string) {
        this.pkgRoot = find(this.initialEntry).next().value
    }
    private graph = new Graph()
    private symTbl = new SymTbl()
    private pkgRoot: find.PackageWithPath

    /**
     * 从顶层遍历一遍ast，获取所依赖的路径，并且把 export default 加入到符号表中，
     * 以确保import default 和 export default 是同一个名字的变量
     * @param filePath 文件绝对路径
     * @returns 节点
     */
    private getImports(filePath: string): ModNode {
        const importsMap = new Map<string, string>()
        const res = JSParser.parse(readFileSync(filePath).toString(), {
            sourceType: "module"
        })
        const relPath = getRelPath(filePath, this.pkgRoot.__path)
        let counter = 0
        for (const stmt of res.program.body) {
            switch (stmt.type) {
                case 'ImportDeclaration':
                case 'ExportNamedDeclaration':
                    if (!stmt.source) { // 必须是 import from
                        continue
                    }
                    const source = stmt.source.value
                    if (source.startsWith('.')) { // 相对路径
                        importsMap.set(source, getExactName(join(dirname(filePath), source)))
                    } else { // npm package
                        importsMap.set(source, getExactNpm(join(this.pkgRoot.__path, '../node_modules', source)))
                    }
                    break
                case 'ExportDefaultDeclaration':
                    const varName = `${convertPath(relPath)}_default`
                    this.symTbl.addSymbol(varName) // 先直接加入符号表中，避免换名字
                default:
                    break
            }
        }
        return {
            id: counter++,
            path: filePath,
            relPath,
            depStr: importsMap,
            prog: res,
        }
    }

    private traverseAST(mod: ModNode) {
        const ctx: IContext = {
            filePath: mod.path,
            pkgPath: this.pkgRoot.__path,
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
        const sortedAST = this.genDependencyArr().flatMap(v => {
            this.traverseAST(v)
            return v.prog.program.body
        })
        const str = generate(ast.program(sortedAST)).code
        writeFileSync(p, str)
    }
}

const fileName = 'test/index.js' ?? process.argv[1]

const initialEntry = join(process.cwd(), fileName)

const bundler = new Bundler(initialEntry)

bundler.dump('test/tmp1.mjs')
