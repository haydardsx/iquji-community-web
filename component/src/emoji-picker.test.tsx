import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { IqujiEmojiPicker } from "./emoji-picker.js";
describe("Emoji 选择器", () => {
  it("禁用状态和可访问名称由调用方控制", () => {
    const html = renderToStaticMarkup(<IqujiEmojiPicker value="🤖" disabled onChange={() => {}} label="选择头像" searchLabel="搜索" emptyLabel="没有结果" clearLabel="恢复默认" options={[{ value: "🤖", label: "机器人" }]} />);
    expect(html).toContain("iquji-button--primary");
    expect(html).toContain("disabled"); expect(html).toContain('aria-label="选择头像"'); expect(html).toContain("🤖");
  });
  it("触发按钮显式使用次级样式", () => {
    const html = renderToStaticMarkup(<IqujiEmojiPicker variant="secondary" value={null} onChange={() => {}} label="选择头像" searchLabel="搜索" emptyLabel="没有结果" clearLabel="恢复默认" options={[]} />);
    expect(html).toContain("iquji-button--secondary");
    expect(html).toContain('aria-label="选择头像"');
  });
});

import { act } from "react";
import { createRoot } from "react-dom/client";
import { IqujiOverlayProvider } from "./overlay-layer.js";
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
it("搜索分类、方向键导航与完整组合序列选择", async () => {
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host);
  const selections: (string | null)[] = [];
  const settle = () => new Promise<void>(resolve => setTimeout(resolve, 30));
  const click = async (target: HTMLElement) => { await act(async () => { target.click(); await settle(); }); };
  try {
    await act(async () => { root.render(<IqujiOverlayProvider><IqujiEmojiPicker value="🤖" onChange={value => { selections.push(value); }} label="选择头像" searchLabel="搜索" emptyLabel="没有结果" clearLabel="恢复默认" allLabel="全部" options={[{ value: "🤖", label: "机器人", category: "角色" }, { value: "🧑🏽‍💻", label: "开发者", category: "角色" }, { value: "🎨", label: "绘画", category: "工作" }]} /></IqujiOverlayProvider>); await settle(); });
    await click(host.querySelector<HTMLButtonElement>('button[aria-label="选择头像"]')!);
    const input = document.querySelector<HTMLInputElement>(".iquji-emoji-picker input")!;
    await act(async () => { input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })); await settle(); });
    expect(document.activeElement?.getAttribute("aria-label")).toBe("机器人");
    await act(async () => { document.activeElement?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })); await settle(); });
    expect(document.activeElement?.getAttribute("aria-label")).toBe("开发者");
    await click(document.activeElement as HTMLElement);
    expect(selections).toEqual(["🧑🏽‍💻"]);
    await click(host.querySelector<HTMLButtonElement>('button[aria-label="选择头像"]')!);
    const category = Array.from(document.querySelectorAll<HTMLButtonElement>(".iquji-emoji-picker__categories button")).find(item => item.textContent === "工作")!;
    await click(category);
    expect(document.querySelectorAll(".iquji-emoji-picker__grid button")).toHaveLength(1);
    const search = document.querySelector<HTMLInputElement>(".iquji-emoji-picker input")!;
    await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(search, "不存在"); search.dispatchEvent(new Event("input", { bubbles: true })); await settle(); });
    expect(document.querySelector('.iquji-emoji-picker [role="status"]')?.textContent).toBe("没有结果");
  } finally { await act(async () => root.unmount()); host.remove(); }
});
