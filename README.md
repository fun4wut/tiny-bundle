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
  - [ ] Duplicate Name
  - [ ] Tree Shaking
  - [ ] Dead Code Elimination
## 思路

1. 根据给定入口，进行依赖收集，获取所有待打包文件
2. 拓扑排序，确定打包顺序
3. runtime代码注入
4. 变量命名修改
5. 按顺序写入一份文件

## Bundle的一般规则

| 源文件                                  | 打包后                  |
| --------------------------------------- | ----------------------- |
| 顶层函数 `function`                     | 在顶层进行定义          |
| 顶层变量 `var`, `let`, `const`, `class` | 顶层声明，`init` 中定义 |
| 顶层语句                                | `init` 中使用           |