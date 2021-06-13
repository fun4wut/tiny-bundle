import { ITraversePlugin } from "./types";


export const DeclPlugin: ITraversePlugin = (ctx, next) => {
    const { stmt } = ctx
    switch (stmt.type) {
        case 'VariableDeclaration':
            
            break
        case 'ClassDeclaration':
            
            break
        case 'FunctionDeclaration':

            break
        default:
            break
    }
    next()
}
