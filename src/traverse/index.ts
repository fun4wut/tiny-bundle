import traverse, { NodePath } from '@babel/traverse'
import JSParser from '@babel/parser'
import * as ast from '@babel/types'
import { getExactName, getExactNpm } from '../utils/file';
import { IContext } from './types';
import { join, dirname } from 'path'
import { readFileSync } from 'fs';


export function doTraverse(ctx: IContext) {
    const { importsArr, pkgPath, filePath, symTbl } = ctx
    function doRename(path: NodePath, id: ast.Identifier) {
        if (symTbl.contains(id.name)) {
            path.scope.rename(id.name, symTbl.getSymbol(id.name))
        } else {
            symTbl.addSymbol(id.name)
        }
    }
    const res = JSParser.parse(readFileSync(filePath).toString(), {
        sourceType: "module"
    })
    // 原来的export暂且保留
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
    const handleFnClass = (path: NodePath<ast.FunctionDeclaration | ast.ClassDeclaration>) => {
        if (path.parent.type !== 'Program') {
            return
        }
        doRename(path, path.node.id)
    }
    const handleVar = (path: NodePath<ast.VariableDeclaration>) => {
        if (path.parent.type !== 'Program') {
            return
        }
        for (const { id } of path.node.declarations) {
            if (id.type === 'Identifier') {
                doRename(path, id)
            }
        }
    }
    try {
        traverse(res, {
            ImportDeclaration: handleImportExport,
            ExportNamedDeclaration: handleImportExport,
            VariableDeclaration: handleVar,
            FunctionDeclaration: handleFnClass,
            ClassDeclaration: handleFnClass,
            
        })
        ctx.body = res.program.body
    } catch (error) {
        console.log('err', ctx)
        throw new Error(error);
    }

}