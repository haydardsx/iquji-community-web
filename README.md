# Iquji Web

简体中文 | [English](README.en.md)

现代、模块化、高可访问性的 Web 前端基础工具与组件库套件。提供独立解耦的 UI 组件、富文本/代码编辑器、设计主题变量、矢量图标、动效原语、国际化、数据查询状态与 HTTP 传输能力。

> **在线预览**: 访问 [community-web.iquji.com](https://community-web.iquji.com) 体验交互式组件目录与全量能力总览。

---

## 核心特性

- 🧩 **模块化架构**：8 个正式公开 npm 包，各包按需独立安装与使用，无多余捆绑。
- ♿ **高可访问性优先**：基于 Base UI 底座与 WAI-ARIA 规范构建，内建完善的键盘导航与读屏支持。
- 🎨 **灵活的主题系统**：语义化 CSS Tokens，原生支持浅色 / 深色主题平滑过渡与首帧防闪。
- 🌐 **完备的国际化与动效**：解耦的词典注入机制与遵守 `prefers-reduced-motion` 的流畅动效。
- ⚡ **现代工程化标准**：采用 Bun 1.3.14 构建、严格 TypeScript 类型声明及 Biome 代码规范。

---

## 软件包概览

| 软件包 | 说明 | 文档 |
| :--- | :--- | :--- |
| **`@iquji-web/web-component`** | 表单、布局、三栏工作台、桌面壳、浮层对话框等核心 UI 组件 | [中文](component/README.md) · [EN](component/README.en.md) |
| **`@iquji-web/web-theme`** | 主题 Provider、深浅色模式切换、首帧防闪脚本与设计 Tokens | [中文](theme/README.md) · [EN](theme/README.en.md) |
| **`@iquji-web/web-icons`** | 矢量图标库、无障碍标签与装饰语义支持 | [中文](icons/README.md) · [EN](icons/README.en.md) |
| **`@iquji-web/web-motion`** | 页面进场动效原语与系统动效偏好适配 | [中文](motion/README.md) · [EN](motion/README.en.md) |
| **`@iquji-web/web-i18n`** | 应用级轻量国际化 Provider、语言持久化与插值翻译 | [中文](i18n/README.md) · [EN](i18n/README.en.md) |
| **`@iquji-web/web-query`** | 基于 React Query 的标准化查询客户端与重试策略 | [中文](query/README.md) · [EN](query/README.en.md) |
| **`@iquji-web/web-network`** | 原生 HTTP 传输抽象、可注入 Fetch、超时与取消控制 | [中文](network/README.md) · [EN](network/README.en.md) |
| **`@iquji-web/web-editor`** | Markdown / JSON / YAML / TOML 源码与富文本编辑器预设 | [中文](editor/README.md) · [EN](editor/README.en.md) |
| **`@iquji-web/web-preview`** | 全量组件与公开能力的交互式预览应用 (私有应用) | [中文](preview/README.md) · [EN](preview/README.en.md) |

---

## 快速上手

### 1. 安装核心包

使用你喜爱的包管理器安装所需包（以 `@iquji-web/web-component` 为例）：

```bash
# npm
npm install @iquji-web/web-component @iquji-web/web-theme @iquji-web/web-icons

# pnpm
pnpm add @iquji-web/web-component @iquji-web/web-theme @iquji-web/web-icons

# Bun
bun add @iquji-web/web-component @iquji-web/web-theme @iquji-web/web-icons
```

> **注意**：`react` 与 `react-dom` (>= 19) 作为 peerDependencies，请确保宿主项目中已安装。

### 2. 引入样式

在应用入口处按顺序引入主题变量与组件基础样式：

```tsx
// 必须优先引入 theme tokens，然后再引入 component 样式
import "@iquji-web/web-theme/tokens.css";
import "@iquji-web/web-component/styles.css";
```

### 3. 基础使用示例

```tsx
import { IqujiThemeProvider } from "@iquji-web/web-theme";
import { IqujiOverlayProvider, IqujiButton, IqujiField, IqujiInput } from "@iquji-web/web-component";
import { IqujiIcon } from "@iquji-web/web-icons";

export function App() {
  return (
    <IqujiThemeProvider defaultMode="system" storageKey="app.theme">
      <IqujiOverlayProvider>
        <div style={{ padding: 24, maxWidth: 480 }}>
          <IqujiField label="服务器名称" required>
            <IqujiInput placeholder="请输入生产服务节点" />
          </IqujiField>
          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <IqujiButton>保存配置</IqujiButton>
            <IqujiButton variant="secondary">取消</IqujiButton>
          </div>
        </div>
      </IqujiOverlayProvider>
    </IqujiThemeProvider>
  );
}
```

---

## 本地开发与测试

本项目要求使用 **Bun 1.3.14** 进行构建与包管理。

```bash
# 安装根依赖与校验环境
bun install

# 执行全局自动化检查（类型检查、单元测试、Linter、打包完整性校验）
bun run check

# 启动组件交互式预览应用 (监听 http://127.0.0.1:5175)
cd preview && bun run dev

# 打包各正式包产物
bun run pack -- <output-directory>
```

### 模块依赖关系

```
icons, theme, motion, i18n, query, network (无内部交叉依赖)
    └── component (依赖 icons 与 theme)
          └── editor (依赖 component, icons, theme)
                └── preview (全量集成演示)
```

---

## 贡献与许可

- 欢迎提交 Issue 与 Pull Request，详情请查阅 [CONTRIBUTING.md](CONTRIBUTING.md)。
- 本项目采用 [MIT License](LICENSE) 开源协议。
