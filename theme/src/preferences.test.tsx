import { afterEach, beforeEach, expect, test } from "bun:test";
import { runInNewContext } from "node:vm";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  createThemePrepaintScript,
  IqujiThemeProvider,
  useIqujiTheme,
} from "./index.js";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const device = (
  window as unknown as {
    happyDOM: { settings: { device: { prefersColorScheme: string } } };
  }
).happyDOM.settings.device;
const roots: Root[] = [];
let originalScheme: string;
let originalStorage: PropertyDescriptor | undefined;
let attributes: Array<[string, string | null]>;

beforeEach(() => {
  originalScheme = device.prefersColorScheme;
  device.prefersColorScheme = "light";
  originalStorage = Object.getOwnPropertyDescriptor(window, "localStorage");
  attributes = ["data-theme", "data-density", "style"].map((name) => [
    name,
    document.documentElement.getAttribute(name),
  ]);
  for (const [name] of attributes)
    document.documentElement.removeAttribute(name);
});

async function unmount() {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
}

afterEach(async () => {
  await unmount();
  if (originalStorage)
    Object.defineProperty(window, "localStorage", originalStorage);
  else Reflect.deleteProperty(window, "localStorage");
  device.prefersColorScheme = originalScheme;
  for (const [name, value] of attributes) {
    if (value === null) document.documentElement.removeAttribute(name);
    else document.documentElement.setAttribute(name, value);
  }
  document.body.replaceChildren();
});

function Preference() {
  const { mode, resolvedTheme, density, setMode } = useIqujiTheme();
  return (
    <>
      <output>{`${mode}/${resolvedTheme}/${density}`}</output>
      <button onClick={() => setMode("dark")} type="button">
        dark
      </button>
      <button onClick={() => setMode("light")} type="button">
        light
      </button>
    </>
  );
}

async function mount(storageKey?: string) {
  const element = document.createElement("div");
  document.body.append(element);
  const root = createRoot(element);
  roots.push(root);
  await act(async () => {
    root.render(
      <IqujiThemeProvider
        density="compact"
        {...(storageKey === undefined ? {} : { storageKey })}
      >
        <Preference />
      </IqujiThemeProvider>,
    );
  });
  return element;
}

async function choose(element: HTMLElement, index: number) {
  const button = element.querySelectorAll("button")[index];
  if (!button) throw new Error("缺少主题操作");
  await act(async () => {
    button.click();
  });
}

test("无存储键时只保留当前实例状态且重挂载重置", async () => {
  let accesses = 0;
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    get() {
      accesses++;
      throw new Error("不应读取存储");
    },
  });
  const element = await mount();
  expect(element.querySelector("output")?.textContent).toBe(
    "system/light/compact",
  );
  await choose(element, 0);
  expect(element.querySelector("output")?.textContent).toBe(
    "dark/dark/compact",
  );
  expect(document.documentElement.dataset.theme).toBe("dark");
  await unmount();
  expect((await mount()).querySelector("output")?.textContent).toBe(
    "system/light/compact",
  );
  expect(accesses).toBe(0);
});

test("持久化只使用应用明确注入的存储键", async () => {
  const values = new Map([
    ["consumer.theme", "dark"],
    ["other.theme", "light"],
  ]);
  const reads: string[] = [];
  const writes: Array<[string, string]> = [];
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    get: () => ({
      getItem(key: string) {
        reads.push(key);
        return values.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        writes.push([key, value]);
        values.set(key, value);
      },
    }),
  });
  const element = await mount("consumer.theme");
  expect(element.querySelector("output")?.textContent).toBe(
    "dark/dark/compact",
  );
  await choose(element, 1);
  expect(reads).toEqual(["consumer.theme"]);
  expect(writes).toEqual([["consumer.theme", "light"]]);
  expect(values.get("other.theme")).toBe("light");
  expect(document.documentElement.style.colorScheme).toBe("light");
});

test("存储拒绝时仍能切换主题", async () => {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    get() {
      throw new Error("storage disabled");
    },
  });
  const element = await mount("consumer.theme");
  await choose(element, 0);
  expect(element.querySelector("output")?.textContent).toBe(
    "dark/dark/compact",
  );
});

test("系统主题变化同步DOM，明确选择后不再跟随系统", async () => {
  const element = await mount();
  await act(async () => {
    device.prefersColorScheme = "dark";
    window.dispatchEvent(new Event("resize"));
  });
  expect(element.querySelector("output")?.textContent).toBe(
    "system/dark/compact",
  );
  await choose(element, 1);
  await act(async () => {
    device.prefersColorScheme = "light";
    window.dispatchEvent(new Event("resize"));
    device.prefersColorScheme = "dark";
    window.dispatchEvent(new Event("resize"));
  });
  expect(element.querySelector("output")?.textContent).toBe(
    "light/light/compact",
  );
  expect(document.documentElement.dataset.density).toBe("compact");
});

test("首帧脚本无存储键不读存储，受限存储时按系统降级", () => {
  device.prefersColorScheme = "dark";
  let reads = 0;
  const context = {
    document,
    matchMedia: window.matchMedia.bind(window),
    get localStorage() {
      reads++;
      throw new Error("storage disabled");
    },
  };
  runInNewContext(createThemePrepaintScript({ density: "compact" }), context);
  expect(reads).toBe(0);
  expect(document.documentElement.dataset.theme).toBe("dark");
  runInNewContext(
    createThemePrepaintScript({
      storageKey: "consumer.theme",
      density: "compact",
    }),
    context,
  );
  expect(reads).toBe(1);
  expect(document.documentElement.dataset.theme).toBe("dark");
});
