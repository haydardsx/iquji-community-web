# Community Web 能力预览

本应用提供 Community Web 正式包的公开能力目录和交互示例，不属于 npm 正式发布包，通过 GitHub Pages 提供[在线能力预览](https://community-web.iquji.com)。目录覆盖 component、editor、i18n、icons、motion、network、query 和 theme 的公开 JavaScript、类型与 CSS 出口；preview 自身、测试支持出口、测试和构建脚本不作为页面能力。

## 启动

首次运行先在各目标包目录执行 `bun install --frozen-lockfile` 和 `bun run build`，再在本目录执行：

~~~sh
bun install --frozen-lockfile
bun run dev
~~~

开发服务器固定监听 http://127.0.0.1:5175，端口被占用时会直接失败。开发模式和构建均使用各包的正式出口；网络和查询示例只使用本地状态或注入替身，不请求外部服务。

## 检查

~~~sh
bun run check
bun run build
~~~

目录按能力分组并支持搜索。添加或修改 Community 正式出口时，必须在 `src/catalog.ts` 更新覆盖清单，在 `src/previews` 注册分类、名称、关键词和可操作示例；覆盖测试会检查包目录、正式出口和预览条目一致。

构建默认使用站点根路径；项目 Pages 部署由 `PAGES_BASE_PATH` 指定资源前缀。只有 `dist` 进入 Pages，不发布源码、开发配置或测试输出。
