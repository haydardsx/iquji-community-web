import { afterEach, beforeEach, expect, test } from "bun:test";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  createTranslator,
  IqujiLocaleProvider,
  parseLocale,
  useIqujiLocale,
} from "./index.js";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const roots: Root[] = [];
const restored: Array<() => void> = [];
let originalLang: string;

function property(object: object, key: string, descriptor: PropertyDescriptor) {
  const original = Object.getOwnPropertyDescriptor(object, key);
  Object.defineProperty(object, key, { configurable: true, ...descriptor });
  restored.push(() => {
    if (original) Object.defineProperty(object, key, original);
    else Reflect.deleteProperty(object, key);
  });
}

beforeEach(() => {
  originalLang = document.documentElement.lang;
  property(navigator, "languages", { value: ["zh-CN"] });
  property(navigator, "language", { value: "zh-CN" });
});

async function unmount() {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
}

afterEach(async () => {
  await unmount();
  for (const restore of restored.splice(0).reverse()) restore();
  document.documentElement.lang = originalLang;
  document.body.replaceChildren();
});

function Preference() {
  const { locale, translate, setLocale } = useIqujiLocale<"ready">();
  return (
    <>
      <output>{`${locale}/${translate("ready")}`}</output>
      <button onClick={() => setLocale("en-US")} type="button">
        English
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
      <IqujiLocaleProvider
        catalogs={{ "zh-CN": { ready: "就绪" }, "en-US": { ready: "Ready" } }}
        {...(storageKey === undefined ? {} : { storageKey })}
      >
        <Preference />
      </IqujiLocaleProvider>,
    );
  });
  return element;
}

async function english(element: HTMLElement) {
  const button = element.querySelector("button");
  if (!button) throw new Error("缺少语言操作");
  await act(async () => {
    button.click();
  });
}

test("只解析当前支持语言，词典由调用方注入并保留插值与缺失key降级", () => {
  expect(parseLocale("zh-Hans-CN")).toBe("zh-CN");
  expect(parseLocale("en-GB")).toBe("en-US");
  expect(parseLocale("fr-FR")).toBeUndefined();
  expect(
    createTranslator({ greeting: "你好，{name}" })("greeting", {
      name: "朋友",
    }),
  ).toBe("你好，朋友");
  expect(
    createTranslator({} as Readonly<Record<"missing", string>>)("missing"),
  ).toBe("missing");
});

test("没有存储键时不读取浏览器存储且重新挂载回到浏览器语言", async () => {
  let accesses = 0;
  property(window, "localStorage", {
    get() {
      accesses++;
      throw new Error("不应读取存储");
    },
  });
  const element = await mount();
  expect(element.querySelector("output")?.textContent).toBe("zh-CN/就绪");
  await english(element);
  expect(element.querySelector("output")?.textContent).toBe("en-US/Ready");
  expect(document.documentElement.lang).toBe("en-US");
  await unmount();
  expect((await mount()).querySelector("output")?.textContent).toBe(
    "zh-CN/就绪",
  );
  expect(accesses).toBe(0);
});

test("只读取和写入应用明确提供的语言键", async () => {
  const reads: string[] = [];
  const writes: Array<[string, string]> = [];
  property(window, "localStorage", {
    get: () => ({
      getItem(key: string) {
        reads.push(key);
        return "en-US";
      },
      setItem(key: string, value: string) {
        writes.push([key, value]);
      },
    }),
  });
  const element = await mount("consumer.locale");
  expect(element.querySelector("output")?.textContent).toBe("en-US/Ready");
  await english(element);
  expect(reads).toEqual(["consumer.locale"]);
  expect(writes).toEqual([["consumer.locale", "en-US"]]);
});

test("浏览器拒绝存储时仍可切换当前词典", async () => {
  property(window, "localStorage", {
    get() {
      throw new Error("storage disabled");
    },
  });
  const element = await mount("consumer.locale");
  await english(element);
  expect(element.querySelector("output")?.textContent).toBe("en-US/Ready");
  expect(document.documentElement.lang).toBe("en-US");
});
