# Community Web 能力预览 (Preview)

简体中文 | [English](README.en.md)

本应用是 Iquji Web 基础包全量公开能力的交互式预览与测试工作台，采用 Vite + React 19 构建，并通过 GitHub Pages 提供[在线预览站点](https://community-web.iquji.com)。

---

## 核心特性

- 🌟 **HeroUI 风格大盘总览**：提供分类组件卡片矩阵、能力指标与微缩视觉预览。
- 🌓 **明暗主题一键切换**：基于 `@iquji-web/web-theme` 驱动，支持浅色与深色模式瞬时平滑过渡。
- 🌐 **全量中英文支持**：基于 `@iquji-web/web-i18n` 驱动，顶栏、侧栏、总览卡片与组件说明支持实时无刷新切换。
- 🔍 **即时搜索与过滤**：支持组件名称、分类、描述与关键词实时检索。
- 🛡️ **100% 覆盖率保障**：内建 AST 出口覆盖率校验 (`coverage.test.ts`)，确保所有正式包公开 API 均有对应交互演示。

---

## 本地启动

首次开发前，请先在各关联包中完成构建，然后在本目录运行：

```bash
# 安装依赖
bun install --frozen-lockfile

# 启动开发服务器 (固定监听 http://127.0.0.1:5175)
bun run dev
```

---

## 代码检查与构建

```bash
# 代码风格检查 (Biome)
bun run lint

# TypeScript 类型检查
bun run typecheck

# 覆盖率与组件单元测试
bun run test

# 生产环境静态打包 (产出到 dist/)
bun run build
```

---

## 新增组件预览指南

当向 `@iquji-web/*` 正式包新增出口或组件时：
1. 在 `src/catalog.ts` 的 `COMMUNITY_PREVIEW_COVERAGE` 登记对应的导出标识符；
2. 在 `src/previews/` 对应的分类文件中实现交互式 Demo，并指定分类、名称、中英文说明与关键词；
3. 运行 `bun test ./src` 验证覆盖率测试通过。
