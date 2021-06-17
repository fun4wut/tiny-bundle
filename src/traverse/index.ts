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
        symTbl.addSymbol(id.name)
        if (!symTbl.isUnique(id.name)) {
            console.log('dup!' + id.name)
            path.scope.rename(id.name, symTbl.getSymbol(id.name))
        }

    }
    const res = JSParser.parse(readFileSync(filePath).toString(), {
        sourceType: "module"
    })

    const handleLink = (path: NodePath<ast.ImportDeclaration | ast.ExportNamedDeclaration>) => {
        const stmt = path.node
        if (!stmt.source) { // 必须是 import from
            return
        }
        const source = stmt.source.value
        if (source.startsWith('.')) { // 相对路径
            importsArr.push(getExactName(join(dirname(filePath), source)))
        } else { // npm package
            importsArr.push(getExactNpm(join(pkgPath, '../node_modules', source)))
        }
        path.remove() // 删去import语句
    }

    const handleExportDefault = (path: NodePath<ast.ExportDefaultDeclaration>) => {
        path.remove()
    }

    const handleExportNamed = (path: NodePath<ast.ExportNamedDeclaration>) => {
        if (path.node.source) {
            handleLink(path) // export from 形式
            return
        }
        if (path.node.specifiers.length > 0) {
            path.remove() // export没有定义新变量，直接remove
            return
        }
        path.traverse({
            VariableDeclaration: handleVar,
            ClassDeclaration: handleClass,
            FunctionDeclaration: handleFn
        })
        path.replaceWith(path.node.declaration)
    }

    const handleFn = (path: NodePath<ast.FunctionDeclaration | ast.ClassDeclaration>): void => {
        if (path.parent.type !== 'Program') {
            return
        }
        doRename(path, path.node.id)
    }

    const handleClass = (path: NodePath<ast.ClassDeclaration>) => {
        handleFn(path)
        const classNode: ast.Class = path.node
        // class 声明变为 var
        path.replaceWith(ast.variableDeclaration('var', [
            ast.variableDeclarator(classNode.id, {...classNode, type: 'ClassExpression', id: null})
        ]))
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
        path.node.kind = 'var' // const, let => var
    }

    try {
        traverse(res, {
            ImportDeclaration: handleLink,
            ExportNamedDeclaration: handleExportNamed,
            VariableDeclaration: handleVar,
            FunctionDeclaration: handleFn,
            ClassDeclaration: handleClass,
            ExportDefaultDeclaration: handleExportDefault,
            enter(path) {
                ast.removeComments(path.node)
            }
        })
        const body = res.program.body
        const withComment = ast.addComment(body[0], 'leading', filePath)
        body[0] = withComment
        ctx.body = body
        
    } catch (error) {
        console.log('err', ctx)
        throw new Error(error);
    }

}