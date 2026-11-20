# @iquji-community/web-i18n

[English](README.md)

支持中英文切换、词典和文本插值。

```sh
npm install react@19.2.4 react-dom@19.2.4 @iquji-community/web-i18n
```

```ts
import { createTranslator } from "@iquji-community/web-i18n";

const translate = createTranslator({ greeting: "{name}，你好！" });
translate("greeting", { name: "世界" });
```
