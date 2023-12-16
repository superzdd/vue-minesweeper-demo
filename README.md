# vue-minesweeper-demo

扫雷小游戏

- 基于 Vue3|TypeScript|[Vitesse Lite](https://github.com/antfu/vitesse-lite)
- node版本 v20.10.0

## 项目构建

项目使用了[ni](https://github.com/antfu/ni)，可以用`ni`,`nr`等安装和调试项目，比如:

```bash
# 安装依赖
ni
# 运行调试
nr dev
```

如果还没有安装`ni`，请先全局安装

```bash
npm i -g @antfu/ni
```

可惜发布生产环境`build`还用不了`ni`，仍需要运行`pnpm`

```bash
# 发布生产环境，生成dist文件夹
pnpm build
```
