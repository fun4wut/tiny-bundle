# Tiny-Bundle

简易JS打包器，不做语法转换，只支持ESM

## 支持Feature

- import文件类型
  - [x] JS
  - [ ] TS
  - [ ] JSON
- import方式
  - [x] 本地文件
  - [x] node_modules
  - [ ] URL
  - [ ] Path alias
  - [x] Export from
  - [ ] Default
  - [ ] Namespace
- 优化
  - [ ] Parallel
  - [ ] 循环引用
  - [ ] Tree Shaking
  - [ ] Dead Code Elimination
## 思路

1. 根据给定入口，进行依赖收集，获取所有待打包文件
2. 拓扑排序，确定打包顺序 (*因为可以循环引用，加之顶层的变量用var表示，这一步似乎没有必要*)
3. runtime代码注入 (*参考 `runtime.go`*)
4. 符号表合并 
   1. 消除同名变量，作用域提升 (通过 `Scope` 和 `Binding`找到引用节点)
5. 按顺序写入一份文件

## Bundle规则(纯ESM情况)

这种情况可以作用域提升，所有模块都直接写在顶层

| 源文件                                  | 打包后                  |
| --------------------------------------- | ----------------------- |
| 顶层函数 `function`                     | 在顶层进行定义          |
| 顶层变量 `var`, `let`, `const`, `class` | 顶层 `var` 定义          |
| 顶层语句                                | 顶层中使用              |
| 别名导入 `import { x as y } from 'bar'` | 无视别名，仍然使用 `x`     |
| 命名空间导入 `import * as mm from 'baz'` | 无视命名空间，使用原本命名   |
| 默认导入 `import z from 'foo'`          | 使用 `foo_default` 代替 `z` |
| Node自带的module                        | 维持使用import            |

## Bundle规则(ESM、CJS混编情况)

模块需要用函数包一层

| 源文件                                  | 打包后                  |
| --------------------------------------- | ----------------------- |
| 顶层函数 `function`                     | 在顶层进行定义          |
| 顶层变量 `var`, `let`, `const`, `class` | 顶层 `var` 声明，`init` 中定义 |
| 顶层语句                                | `init` 中使用           |


## 实用的包
- [Babel Parser(Code -> AST)](https://babeljs.io/docs/en/babel-parser)
- [Babel Traverse(DFS遍历AST)](https://babeljs.io/docs/en/babel-traverse)
- [Babel Template(Template -> AST)](https://babeljs.io/docs/en/babel-template)
- [Babel Generator(AST -> Code)](https://babeljs.io/docs/en/babel-generator)
- [AST Explorer](https://astexplorer.net/)

## Reference
- [Babel Traverse文档](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#toc-traversal)
- [ESBuild设计文档](https://github.com/evanw/esbuild/blob/master/docs/architecture.md)
- [Node.js Module Wrapper](https://nodejs.org/api/modules.html#modules_the_module_wrapper)
- [基于esbuild的universal bundler设计](https://juejin.cn/post/6940250185322725390)