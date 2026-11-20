# @iquji-community/web-i18n

[简体中文](README.zh-CN.md)

English and Chinese locale selection, message dictionaries and string interpolation.

```sh
npm install react@19.2.4 react-dom@19.2.4 @iquji-community/web-i18n
```

```ts
import { createTranslator } from "@iquji-community/web-i18n";

const translate = createTranslator({ greeting: "Hello, {name}!" });
translate("greeting", { name: "World" });
```
