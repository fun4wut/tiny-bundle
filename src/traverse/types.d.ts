import { Program, Statement } from "@babel/types";
import { SymTbl } from "../symbol";

export interface IContext {
    importsArr: Array<string>
    pkgPath: string
    filePath: string
    body: Array<Statement>
    isSpecialStmt: boolean
    symTbl: SymTbl
}

export interface ITraversePlugin {
    (ctx: IContext, next: () => void): void
}