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
  - [ ] Export from
  - [ ] Default
  - [ ] Namespace
- 优化
  - [ ] Tree Shaking
  - [ ] Dead Code Elimination
## 思路

1. 根据给定入口，进行依赖收集，获取所有待打包文件
2. 拓扑排序，确定打包顺序
3. 变量命名修改
4. 按顺序写入一份文件