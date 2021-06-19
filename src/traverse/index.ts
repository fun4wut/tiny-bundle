import traverse, { NodePath } from '@babel/traverse'
import * as ast from '@babel/types'
import { convertPath, getRelPath } from '../utils/file';
import { IContext } from './types';


export function doTraverse(ctx: IContext) {
    const { mod, filePath, symTbl, pkgPath } = ctx
    const nsSet= new Set<string>()
    const handleLink = (path: NodePath<ast.ImportDeclaration>) => {
        const source = path.node.source.value
        for (const spec of path.node.specifiers) {
            if (spec.type === 'ImportDefaultSpecifier') {
                const absolutePath = mod.depStr.get(source)
                const relPath = getRelPath(absolutePath, pkgPath)
                const newName = `${convertPath(relPath)}_default`
                if (path.scope.hasBinding(newName)) { // 如果这个名字被占用，让占用的变量去换个名字
                    const other = path.scope.generateUid(newName)
                    path.scope.rename(newName, other)
                }
                path.scope.rename(spec.local.name, newName)
            }

            if (spec.type === 'ImportNamespaceSpecifier') {
                const ns = spec.local.name
                nsSet.add(ns)
            }
        }
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
        const varName = `${convertPath(mod.relPath)}_default`
        const defaultVar = ast.variableDeclaration('var', [
            ast.variableDeclarator(
                ast.identifier(varName),
                exprAST
            )
        ])
        path.replaceWith(defaultVar)
        path.skip()
    }

    const handleExportNamed = (path: NodePath<ast.ExportNamedDeclaration>) => {
        if (path.node.specifiers.length > 0) {
            path.remove() // export {} 形式，直接remove
            return
        }
        // 去除export，留下子声明
        path.replaceWith(path.node.declaration)
    }

    const handleFn = (path: NodePath<ast.FunctionDeclaration | ast.ClassDeclaration>): void => {
        if (path.parent.type !== 'Program') {
            return
        }
        const oldName = path.node.id.name
        const newName = symTbl.addSymbol(oldName)
        path.scope.rename(oldName, newName)
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
                const newName = symTbl.addSymbol(id.name)
                // console.log(id.name, newName)
                path.scope.rename(id.name, newName)
            }
        }
        path.node.kind = 'var' // const, let => var
    }

    const handleNamespace = (path: NodePath<ast.MemberExpression>) => {
        const obj = path.node.object
        if (obj.type === 'Identifier') {
            if (nsSet.has(obj.name)) {
                path.replaceWith(path.node.property)
            }
        }
    }

    try {
        traverse(mod.prog, {
            ImportDeclaration: handleLink,
            ExportNamedDeclaration: handleExportNamed,
            VariableDeclaration: handleVar,
            FunctionDeclaration: handleFn,
            ClassDeclaration: handleClass,
            ExportDefaultDeclaration: handleExportDefault,
            MemberExpression: handleNamespace,
            enter(path) {
                ast.removeComments(path.node)
            }
        })
        const body = mod.prog.program.body
        const withComment = ast.addComment(body[0], 'leading', filePath)
        body[0] = withComment
        mod.prog.program.body = body
    } catch (error) {
        console.log('err', ctx)
        throw new Error(error);
    }

}