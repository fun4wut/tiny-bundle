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

interface ISymbol {
    originName: string
    useCount: number
    kind: SymbolKind
    link: IRef
}

type SymbolMap = IRef[][]

export class SymTbl {
    tbl: Record<string, number> = {}
    addSymbol(s: string) {
        if (!this.tbl[s]) {
            this.tbl[s] = 0
        }
        this.tbl[s]++
    }
    getSymbol(s: string) {
        if (this.tbl[s] === 1) {
            return s
        }
        return `${s}${this.tbl[s]}`
    }
    isUnique(s: string) {
        return this.tbl[s] === 1
    }
}