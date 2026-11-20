# @iquji-community/web-icons

[English](README.md)

React 图标。装饰图标可设置 decorative，表达含义的图标可设置无障碍标签。

```sh
npm install react@19.2.4 react-dom@19.2.4 @iquji-community/web-icons
```

```tsx
import { IqujiIcon } from "@iquji-community/web-icons";

export function SearchIcon() {
  return <IqujiIcon decorative={false} name="search" label="搜索" />;
}
```
