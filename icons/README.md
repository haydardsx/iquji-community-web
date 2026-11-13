# @iquji-web/web-icons

简体中文 | [English](README.en.md)

Iquji Web 矢量图标库，封装常用 UI 交互图标，严格遵循 WAI-ARIA 可访问性规范，强制声明语义标签或装饰性标记。

---

## 安装

```bash
npm install @iquji-web/web-icons
```

---

## 核心特性与使用

### 可访问性约束

- **装饰性图标**：若图标仅起视觉辅助作用，必须声明 `decorative`：
  ```tsx
  <IqujiIcon decorative name="search" size={16} />
  ```
- **语义性图标**：若图标具备独立操作或含义（如无文字的按钮），必须提供 `label`：
  ```tsx
  <IqujiIcon label="关闭窗口" name="close" size={20} />
  ```

### 完整示例

```tsx
import { IqujiIcon } from "@iquji-web/web-icons";

export function IconDemo() {
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      {/* 搜索图标 */}
      <IqujiIcon decorative name="search" size={18} />

      {/* 设置与用户 */}
      <IqujiIcon decorative name="settings" size={18} />
      <IqujiIcon decorative name="user" size={18} />

      {/* 语言与主题 */}
      <IqujiIcon decorative name="languages" size={18} />
      <IqujiIcon decorative name="sun" size={18} />
      <IqujiIcon decorative name="moon" size={18} />

      {/* 具备可访问性读屏名称的图标 */}
      <button>
        <IqujiIcon label="刷新列表" name="refresh" size={16} />
      </button>
    </div>
  );
}
```

---

## 支持的图标列表

内置涵盖 `arrow-*`, `chevron-*`, `check`, `close`, `settings`, `search`, `sun`, `moon`, `languages`, `home`, `user`, `bell`, `lock`, `filter`, `folder`, `circle-alert`, `circle-info` 等数十款核心交互图标。

---

## 开发与构建

```bash
bun install --frozen-lockfile
bun run build       # 编译打包到 dist/
bun run typecheck   # 类型验证
bun run test        # 单元测试与无障碍校验
bun run check       # 自动化检查
```
