import { Hub, NodePath, Scope } from '@babel/traverse'
import ast from '@babel/types'

enum SymbolKind {
    Function,
    Class,
    Variable,
    Unbound,
    Other
}

interface IRef {
    sourceIdx: number
    innerIdx: number
}

export enum LinkType {
    Import = 'import',
    Export = 'export',
    Local = 'local'
}

interface ISymbol {
    finalName: string
    useCount: number
    linkType: LinkType
    kind?: SymbolKind
    link?: IRef
}

type SymbolMap = IRef[][]

export class SymTbl { // 只记录顶层symbol 
    tbl: Record<string, ISymbol> = {}
    addSymbol(s: string, path?: NodePath, linkType: LinkType = LinkType.Local) {
        if (!this.tbl[s]) {
            this.tbl[s] = { useCount: 1, finalName: s, linkType }
            return s
        }
        const rc = ++this.tbl[s].useCount
        const prev = s + rc

        let newName = prev, idx = 0
        do {
            newName = Array.from({ length: idx++ }).map(_ => '_') + prev
        } while (path && path.scope.hasBinding(newName))
        this.tbl[s].finalName = newName
        return newName
    }
    getSymbol(s: string) {
        return this.tbl[s]
    }
    isUnique(s: string) {
        console.log(s, this.tbl[s])
        return this.tbl[s].useCount === 1
    }
    containsSymbol(s: string) {
        return this.tbl[s] && this.tbl[s].useCount > 0
    }
}