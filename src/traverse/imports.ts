import { Statement } from "@babel/types";
import path from "path";
import { getExactName, getExactNpm } from "../utils/file";
import { ITraversePlugin } from "./types";

export const ImportsPlugin: ITraversePlugin = (ctx, next) => {
    const { stmt, filePath, pkgPath, importsArr } = ctx
    switch (stmt.type) {
        case 'ImportDeclaration':
        case 'ExportNamedDeclaration':
            ctx.isSpecialStmt = true
            if (!stmt.source) {
                break
            }
            const source = stmt.source.value
            if (source.startsWith('.')) { // 相对路径
                importsArr.push(getExactName(path.join(path.dirname(filePath), source)))
            } else { // npm package
                importsArr.push(getExactNpm(path.join(pkgPath, '../node_modules', source)))
            }
            break
        default:
            break
    }
    next()
}
