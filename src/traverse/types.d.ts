import { Statement } from "@babel/types";

export interface IContext {
    stmt: Statement
    importsArr: Array<string>
    pkgPath: string
    filePath: string
}

export interface ITraversePlugin {
    (ctx: IContext, next: () => void): void
}