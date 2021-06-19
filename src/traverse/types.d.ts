import { Scope } from "@babel/traverse";
import { Program, Statement } from "@babel/types";
import { ModNode } from "../graph";
import { SymTbl } from "../symbol";

export interface IContext {
    mod: ModNode
    pkgPath: string
    filePath: string
    symTbl: SymTbl
}

export interface ITraversePlugin {
    (ctx: IContext, next: () => void): void
}