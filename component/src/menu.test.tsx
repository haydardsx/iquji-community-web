import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactNode, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { IqujiDropdownMenu } from "./floating.js";
import { IqujiOverlayProvider } from "./overlay-layer.js";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const roots: Root[] = [];
const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 40));

afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.replaceChildren();
});

async function render(content: ReactNode) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  roots.push(root);
  await act(async () => {
    root.render(<IqujiOverlayProvider>{content}</IqujiOverlayProvider>);
    await tick();
  });
}

function required<T>(value: T | null | undefined): T {
  if (value == null) throw new Error("测试中缺少目标元素");
  return value;
}

async function click(element: HTMLElement) {
  await act(async () => {
    element.focus();
    element.click();
    await tick();
  });
}

function menuItem(text: string) {
  return required(
    Array.from(
      document.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    ).find((element) => element.textContent?.includes(text)),
  );
}

describe("下拉菜单正式行为", () => {
  test("渲染图标、快捷键、分组、禁用项和结构化子菜单", async () => {
    const selected: string[] = [];

    function Harness() {
      const [open, setOpen] = useState(true);
      return (
        <IqujiDropdownMenu
          ariaLabel="Actions"
          items={[
            {
              icon: <span aria-hidden="true">icon</span>,
              key: "rename",
              keyshortcuts: "Meta+R",
              label: "Rename",
              onSelect: () => selected.push("rename"),
              shortcut: "⌘R",
            },
            { key: "separator", kind: "separator" },
            { key: "group", kind: "label", label: "More" },
            { disabled: true, key: "blocked", label: "Plan task" },
            {
              items: [
                {
                  key: "copy-link",
                  label: "Copy link",
                  onSelect: () => selected.push("copy-link"),
                },
              ],
              key: "copy",
              kind: "submenu",
              label: "Copy",
            },
            {
              key: "custom",
              label: "Custom",
              submenu: <span>Custom payload</span>,
            },
          ]}
          onOpenChange={setOpen}
          open={open}
          trigger={<button type="button">Open actions</button>}
        />
      );
    }

    await render(<Harness />);
    const menu = required(document.querySelector<HTMLElement>('[role="menu"]'));
    expect(menu.getAttribute("aria-label")).toBe("Actions");
    expect(menu.textContent).toContain("Rename");
    expect(menu.textContent).toContain("⌘R");
    expect(menu.textContent).toContain("More");
    expect(document.querySelector('[role="separator"]')).not.toBeNull();

    const rename = menuItem("Rename");
    expect(rename.getAttribute("aria-keyshortcuts")).toBe("Meta+R");
    const blocked = menuItem("Plan task");
    expect(blocked.getAttribute("aria-disabled")).toBe("true");

    await click(rename);
    expect(selected).toEqual(["rename"]);

    const trigger = required(
      document.querySelector<HTMLButtonElement>("button"),
    );
    await click(trigger);
    await click(menuItem("Copy"));
    const copyLink = required(
      Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]')).find(
        (element) => element.textContent?.includes("Copy link"),
      ),
    );
    await click(copyLink);
    expect(selected).toEqual(["rename", "copy-link"]);

    await click(trigger);
    await click(menuItem("Custom"));
    expect(document.body.textContent).toContain("Custom payload");
  });
});
