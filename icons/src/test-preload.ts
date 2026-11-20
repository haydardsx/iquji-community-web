import { GlobalRegistrator } from "@happy-dom/global-registrator";

const bunFetchGlobals = {
  fetch: globalThis.fetch,
  Headers: globalThis.Headers,
  Request: globalThis.Request,
  Response: globalThis.Response,
};

GlobalRegistrator.register({ url: "http://localhost/" });

Object.assign(globalThis, bunFetchGlobals);
