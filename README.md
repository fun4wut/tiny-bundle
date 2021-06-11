# Tiny-Bundle

简易JS打包器，不做语法转换，只支持ESM

## 支持Feature

- import文件类型
  - [ ] JS
  - [ ] TS
  - [ ] JSON
- import方式
  - [ ] 本地文件
  - [ ] node_modules
  - [ ] URL

## 思路

1. 根据给定入口，进行依赖收集，获取所有待打包文件
2. 拓扑排序，确定打包顺序