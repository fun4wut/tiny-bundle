import { ITraversePlugin } from "./types";


export const DeclPlugin: ITraversePlugin = (ctx, next) => {
    const { stmt } = ctx
    switch (stmt.type) {
        case 'VariableDeclaration':
            ctx.isSpecialStmt = true
            break
        case 'ClassDeclaration':
            ctx.isSpecialStmt = true
            break
        case 'FunctionDeclaration':
            ctx.isSpecialStmt = true
            break
        default:
            break
    }
    next()
}
