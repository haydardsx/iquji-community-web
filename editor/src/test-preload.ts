import { GlobalRegistrator } from "@happy-dom/global-registrator";

const bunFetchGlobals = {
  fetch: globalThis.fetch,
  Headers: globalThis.Headers,
  Request: globalThis.Request,
  Response: globalThis.Response,
};

GlobalRegistrator.register({ url: "http://localhost/" });

Object.assign(globalThis, bunFetchGlobals);

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

// 本地 file 依赖保留自己的安装目录；测试使用与渲染器相同的 React 单例。
const { mock } = await import("bun:test");
const React = await import("react");
const { dirname } = await import("node:path");
const componentEntry = Bun.resolveSync(
  "@iquji-cloud/web-component",
  import.meta.dir,
);
mock.module(Bun.resolveSync("react", dirname(componentEntry)), () => React);
