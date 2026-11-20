import { expect, mock, test } from "bun:test";
import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { IqujiButton } from "./index.js";
import { IqujiPopover } from "./floating.js";
import { IqujiOverlayProvider } from "./overlay-layer.js";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

test("显式虚拟锚点决定浮层位置并保留触发器关闭语义", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const rect = mock(() => new DOMRect(200, 100, 40, 20));
  const anchor = { getBoundingClientRect: rect };
  const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 40));
  function Example() {
    const [open, setOpen] = useState(false);
    return <IqujiPopover anchor={anchor} side="bottom" align="start" collisionAvoidance={{side:"none",align:"none"}} open={open} onOpenChange={setOpen} trigger={<IqujiButton>打开说明</IqujiButton>}><p>独立锚点内容</p></IqujiPopover>;
  }
  try {
    await act(async () => { root.render(<IqujiOverlayProvider><Example /></IqujiOverlayProvider>); await tick(); });
    const trigger = host.querySelector<HTMLButtonElement>("button");
    if (!trigger) throw new Error("未找到触发按钮");
    await act(async () => { trigger.click(); await tick(); });
    const positioner = document.querySelector<HTMLElement>(".iquji-floating-positioner[data-open]");
    expect(rect).toHaveBeenCalled();
    expect(positioner?.style.transform).toBe("translate(200px, 128px)");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    await act(async () => { trigger.click(); await tick(); });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});
