import traverse, { NodePath } from '@babel/traverse'
import * as ast from '@babel/types'
import { getBaseName, getExactName, getExactNpm } from '../utils/file';
import { IContext } from './types';


export function doTraverse(ctx: IContext) {
    const { mod, filePath } = ctx

    const handleLink = (path: NodePath<ast.ImportDeclaration | ast.ExportNamedDeclaration>) => {
        path.remove() // 删去import语句
    }

    const handleExportDefault = (path: NodePath<ast.ExportDefaultDeclaration>) => {
        const declNode = path.node.declaration
        let exprAST: ast.Expression
        switch (declNode.type) {
            case 'Identifier':
                exprAST = ast.identifier(declNode.name)
                break;
            case 'FunctionDeclaration':
                exprAST = { ...declNode, type: 'FunctionExpression' }
                break
            case 'ClassDeclaration':
                exprAST = { ...declNode, type: 'ClassExpression' }
                break
            case 'TSDeclareFunction':
                throw new Error("TS not supported yet");
            default:
                exprAST = declNode
        }
        const varName = `${getBaseName(mod.relPath)}_default`
        const defaultVar = ast.variableDeclaration('var', [
            ast.variableDeclarator(
                ast.identifier(varName),
                exprAST
            )
        ])
        path.replaceWith(defaultVar)
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
        // 去除export，留下子声明
        path.replaceWith(path.node.declaration)
    }

    const handleFn = (path: NodePath<ast.FunctionDeclaration | ast.ClassDeclaration>): void => {
        if (path.parent.type !== 'Program') {
            return
        }
        const newName = path.scope.generateUid(path.node.id.name)
        path.scope.rename(path.node.id.name, newName)
    }

    const handleClass = (path: NodePath<ast.ClassDeclaration>) => {
        handleFn(path)
        const classNode: ast.Class = path.node
        // class 声明变为 var
        path.replaceWith(ast.variableDeclaration('var', [
            ast.variableDeclarator(classNode.id, {...classNode, type: 'ClassExpression', id: null})
        ]))
        path.skip() // 产生了新的var节点，不需要再去做rename了，所以直接skip
    }

    const handleVar = (path: NodePath<ast.VariableDeclaration>) => {
        if (path.parent.type !== 'Program') {
            return
        }
        for (const { id } of path.node.declarations) {
            if (id.type === 'Identifier') {
                path.scope.rename(id.name, path.scope.generateUid(id.name))
            }
        }
        path.node.kind = 'var' // const, let => var
    }

    try {
        traverse(mod.prog, {
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
        const body = mod.prog
        const withComment = ast.addComment(body[0], 'leading', filePath)
        body[0] = withComment
        ctx.body = body
    } catch (error) {
        console.log('err', ctx)
        throw new Error(error);
    }

}