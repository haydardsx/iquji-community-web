import { afterEach, expect, test } from "bun:test";
import { fileURLToPath } from "node:url";
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { type IqujiTab, IqujiTabs } from "./navigation.js";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const roots: Root[] = [];
const styles: HTMLStyleElement[] = [];
afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.replaceChildren();
  for (const style of styles.splice(0)) style.remove();
});
async function render(content: React.ReactNode) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  roots.push(root);
  await act(async () => root.render(content));
  return async (next: React.ReactNode) => {
    await act(async () => root.render(next));
  };
}
function tab(label: string) {
  const found = Array.from(
    document.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
  ).find((element) => element.textContent === label);
  if (!found) throw new Error(`缺少页签 ${label}`);
  return found;
}
async function press(target: HTMLElement, key: string, isComposing = false) {
  await act(async () => {
    target.focus();
    target.dispatchEvent(
      new KeyboardEvent("keydown", {
        key,
        bubbles: true,
        cancelable: true,
        isComposing,
      }),
    );
  });
}
const tabs = [
  { value: "history", label: "修改记录" },
  { value: "confirmed", label: "确认记录", disabled: true },
  { value: "snapshot", label: "历史快照" },
] as const;

test("受控分段页签用点击和键盘切换，跳过禁用项并保留面板命名关系", async () => {
  function Example() {
    const [value, setValue] = useState("history");
    return (
      <>
        <IqujiTabs
          id="records"
          label="文档记录"
          tabs={tabs}
          value={value}
          onChange={setValue}
          panelId="records-panel"
          variant="segmented"
        />
        <section
          role="tabpanel"
          id="records-panel"
          aria-labelledby={`records-${value}`}
        >
          {value}
        </section>
      </>
    );
  }
  await render(<Example />);
  const list = document.querySelector('[role="tablist"]');
  expect(list?.getAttribute("aria-label")).toBe("文档记录");
  expect(tab("修改记录").getAttribute("aria-controls")).toBe("records-panel");
  expect(tab("修改记录").tabIndex).toBe(0);
  expect(tab("确认记录").disabled).toBe(true);
  expect(tab("确认记录").tabIndex).toBe(-1);
  await press(tab("修改记录"), "ArrowRight");
  expect(document.activeElement).toBe(tab("历史快照"));
  expect(tab("历史快照").getAttribute("aria-selected")).toBe("true");
  expect(tab("修改记录").tabIndex).toBe(-1);
  const panel = document.querySelector('[role="tabpanel"]');
  expect(
    document.getElementById(panel?.getAttribute("aria-labelledby") ?? ""),
  ).toBe(tab("历史快照"));
  await press(tab("历史快照"), "ArrowRight");
  expect(document.activeElement).toBe(tab("修改记录"));
  await press(tab("修改记录"), "End");
  expect(document.activeElement).toBe(tab("历史快照"));
  await press(tab("历史快照"), "Home");
  expect(document.activeElement).toBe(tab("修改记录"));
  await press(tab("修改记录"), "ArrowLeft");
  expect(document.activeElement).toBe(tab("历史快照"));
  await act(async () => tab("修改记录").click());
  expect(panel?.textContent).toBe("history");
});

test("页签受控值暂时不可用时仍可进入首个可用项，组合输入不触发切换", async () => {
  const selected: string[] = [];
  const view = (items: readonly IqujiTab<string>[]) => (
    <IqujiTabs
      label="记录"
      tabs={items}
      value="confirmed"
      onChange={(value) => selected.push(value)}
    />
  );
  const update = await render(view(tabs));
  expect(tab("修改记录").tabIndex).toBe(0);
  expect(tab("确认记录").tabIndex).toBe(-1);
  await press(tab("修改记录"), "ArrowRight", true);
  expect(selected).toHaveLength(0);
  await update(view(tabs.map((item) => ({ ...item, disabled: true }))));
  expect(
    Array.from(
      document.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    ).every((item) => item.disabled && item.tabIndex === -1),
  ).toBe(true);
  await update(view([{ value: "snapshot", label: "历史快照" }]));
  expect(tab("历史快照").tabIndex).toBe(0);
  await act(async () => tab("历史快照").click());
  expect(selected).toEqual(["snapshot"]);
});

test("正式样式中的分段页签按内容收紧，选中项不带下划线且禁用状态清晰", async () => {
  for (const path of [
    "@iquji-cloud/web-theme/tokens.css",
    "@iquji-cloud/web-component/styles.css",
  ]) {
    const result = await Bun.build({
      entrypoints: [fileURLToPath(import.meta.resolve(path))],
      target: "browser",
    });
    if (!result.success || !result.outputs[0])
      throw new AggregateError(result.logs, "页签样式构建失败");
    const style = document.createElement("style");
    style.textContent = await result.outputs[0].text();
    document.head.append(style);
    styles.push(style);
  }
  const view = (disabled = false) => (
    <IqujiTabs
      label="记录"
      tabs={[{ label: "修改记录", value: "history", disabled }]}
      value="history"
      onChange={() => {}}
      variant="segmented"
    />
  );
  const update = await render(view());
  const selected = tab("修改记录");
  const list = selected.parentElement;
  if (!list) throw new Error("缺少页签组");
  expect(getComputedStyle(list).width).toBe("fit-content");
  expect(getComputedStyle(selected).borderBottomWidth).toBe("0px");
  const enabledColor = getComputedStyle(selected).color;
  await update(view(true));
  expect(selected.disabled).toBe(true);
  expect(getComputedStyle(selected).color).not.toBe(enabledColor);
  expect(getComputedStyle(selected).boxShadow).toBe("none");
});
