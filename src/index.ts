import * as JSParser from '@babel/parser'
import { readFileSync } from 'fs'
import * as path from 'path'
import { Graph } from './graph'
import { getImports } from './utils/file'


export class Bundler {
    private graph = new Graph()
    private collectDependency = (entry: string) => {
        const res = JSParser.parse(readFileSync(entry).toString(), {
            sourceType: "module"
        })
        const imports = getImports(res.program, entry)
        this.graph.addEdges({
            path: entry,
            depStr: imports
        })
        imports.forEach(this.collectDependency)
    }
    genDependencyArr(initial: string) {
        this.collectDependency(initial)
        return this.graph.topSort()
    }
}

const fileName = 'test/index.js' ?? process.argv[1]

const initialEntry = path.join(process.cwd(), fileName)

const bundler = new Bundler()

console.log(bundler.genDependencyArr(initialEntry))