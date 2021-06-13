import ast from '@babel/types'

enum SymType {
    Function,
    Class,
    Variable
}

export class SymTbl {
    tbl: Record<string, number> = {}
    addSymbol(s: string) {
        if (!this.tbl[s]) {
            this.tbl[s] = 1
        }
        this.tbl[s]++
    }
    getSymbol(s: string) {
        if (this.tbl[s] === 1) {
            return s
        }
        return `${s}${this.tbl[s]}`
    }
}