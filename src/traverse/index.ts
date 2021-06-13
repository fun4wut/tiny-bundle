import traverse, { NodePath } from '@babel/traverse'
import JSParser from '@babel/parser'
import * as ast from '@babel/types'
import { getExactName, getExactNpm } from '../utils/file';
import { IContext } from './types';
import { join, dirname } from 'path'
import { readFileSync } from 'fs';


export function doTraverse(ctx: IContext) {
    const { importsArr, pkgPath, filePath } = ctx
    const res = JSParser.parse(readFileSync(filePath).toString(), {
        sourceType: "module"
    })
    const handleImportExport = (path: NodePath<ast.ImportDeclaration | ast.ExportNamedDeclaration>) => {
        const stmt = path.node
        if (!stmt.source) {
            return
        }
        const source = stmt.source.value
        if (source.startsWith('.')) { // 相对路径
            importsArr.push(getExactName(join(dirname(filePath), source)))
        } else { // npm package
            importsArr.push(getExactNpm(join(pkgPath, '../node_modules', source)))
        }
    }
    try {
        traverse(res, {
            ImportDeclaration: handleImportExport,
            ExportNamedDeclaration: handleImportExport,
            VariableDeclaration(path) {
                
            }
        })
    } catch (error) {
        console.log('err', ctx)
        throw new Error(error);
    }

}