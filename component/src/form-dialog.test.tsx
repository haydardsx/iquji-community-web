import { afterEach, expect, test } from "bun:test";
import { act, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { IqujiConfirmDialog } from "./confirmation.js";
import { IqujiFormDialog } from "./form-dialog.js";
import { IqujiFormSteps } from "./form-steps.js";
import { IqujiOverlayProvider } from "./overlay-layer.js";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const roots: Root[] = [];
const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 40));
afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.replaceChildren();
  document.body.style.overflow = "";
});
async function render(content: React.ReactNode) {
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
  if (value == null) throw new Error("缺少实际表单组件");
  return value;
}
function button(label: string) {
  return required(
    Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(
      (element) =>
        element.textContent === label ||
        element.getAttribute("aria-label") === label ||
        (element.getAttribute("aria-labelledby") &&
          document.getElementById(element.getAttribute("aria-labelledby") ?? "")
            ?.textContent === label),
    ),
  );
}
async function click(target: HTMLElement) {
  await act(async () => {
    target.focus();
    target.click();
    await tick();
  });
}
async function press(target: HTMLElement, key: string) {
  await act(async () => {
    target.dispatchEvent(
      new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
    );
    await tick();
  });
}
async function fill(target: HTMLInputElement, value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set?.call(target, value);
    target.dispatchEvent(new Event("input", { bubbles: true }));
    await tick();
  });
}
const popup = () =>
  required(document.querySelector<HTMLElement>('[role="dialog"][data-open]'));

function Form() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        新建
      </button>
      <IqujiFormDialog
        open={open}
        onOpenChange={(next) => {
          if (!next) setConfirm(true);
        }}
        title="新建文章"
        heading={<span>文档 / 新建文章</span>}
        closeLabel="关闭表单"
        expanded={expanded}
        onExpandedChange={setExpanded}
        expandLabel="展开表单"
        collapseLabel="收起表单"
        initialFocusRef={input}
        actions={<button type="button">保存文章</button>}
      >
        <input ref={input} aria-label="文章标题" />
        <IqujiConfirmDialog
          open={confirm}
          onOpenChange={setConfirm}
          title="放弃草稿？"
          closeLabel="关闭确认"
          cancelLabel="继续编辑"
          confirmLabel="放弃"
          onConfirm={() => {
            setConfirm(false);
            setOpen(false);
          }}
        />
      </IqujiFormDialog>
    </>
  );
}

test("表单展开与收起保留会话、草稿和操作，标题插槽仍有正式可访问名称", async () => {
  await render(<Form />);
  await click(button("新建"));
  const form = popup();
  const input = required(form.querySelector<HTMLInputElement>("input"));
  expect(document.activeElement).toBe(input);
  expect(
    document.getElementById(form.getAttribute("aria-labelledby") ?? "")
      ?.textContent,
  ).toBe("新建文章");
  expect(form.textContent).toContain("文档 / 新建文章");
  await fill(input, "保留展开中的草稿");
  const save = button("保存文章");
  await click(button("展开表单"));
  expect(popup()).toBe(form);
  expect(button("收起表单").getAttribute("aria-expanded")).toBe("true");
  expect(form.querySelector("input")).toBe(input);
  expect(input.value).toBe("保留展开中的草稿");
  expect(button("保存文章")).toBe(save);
  expect(document.activeElement).toBe(button("收起表单"));
  await click(button("收起表单"));
  expect(popup()).toBe(form);
  expect(button("展开表单").getAttribute("aria-expanded")).toBe("false");
  expect(input.value).toBe("保留展开中的草稿");
});

test("表单关闭与 Escape 请求进入同一草稿保护，取消保留编辑器而明确确认才退出", async () => {
  await render(<Form />);
  const trigger = button("新建");
  await click(trigger);
  const form = popup();
  const input = required(form.querySelector<HTMLInputElement>("input"));
  await fill(input, "尚未提交");
  await click(button("关闭表单"));
  expect(document.querySelectorAll('[role="dialog"][data-open]')).toHaveLength(
    2,
  );
  expect(document.activeElement).toBe(button("继续编辑"));
  await click(button("继续编辑"));
  expect(popup()).toBe(form);
  expect(input.value).toBe("尚未提交");
  await act(async () => input.focus());
  await press(input, "Escape");
  expect(document.querySelectorAll('[role="dialog"][data-open]')).toHaveLength(
    2,
  );
  await click(button("放弃"));
  expect(document.querySelectorAll('[role="dialog"][data-open]')).toHaveLength(
    0,
  );
  expect(document.activeElement).toBe(trigger);
});

test("受控表单的展开请求可以由调用方拒绝，不自行改变模式", async () => {
  const requests: boolean[] = [];
  await render(
    <IqujiFormDialog
      open
      title="编辑"
      closeLabel="关闭"
      expanded={false}
      onExpandedChange={(value) => requests.push(value)}
      expandLabel="展开"
      collapseLabel="收起"
    >
      <input />
    </IqujiFormDialog>,
  );
  await click(button("展开"));
  expect(requests).toEqual([true]);
  expect(button("展开").getAttribute("aria-expanded")).toBe("false");
});

test("分步导航使用受控当前步骤，键盘移动跳过禁用项且不自动绕过业务确认", async () => {
  const changes: string[] = [];
  function Steps() {
    const [value, setValue] = useState("basic");
    return (
      <IqujiFormSteps
        label="新建文章步骤"
        completedLabel="已完成"
        steps={[
          {
            id: "basic",
            label: "基础信息",
            description: "填写名称",
            completed: value !== "basic",
          },
          { id: "blocked", label: "不可用步骤", disabled: true },
          { id: "sections", label: "章节" },
          { id: "review", label: "确认" },
        ]}
        value={value}
        onChange={(id) => {
          changes.push(id);
          setValue(id);
        }}
      />
    );
  }
  await render(<Steps />);
  const first = button("基础信息");
  const sections = button("章节");
  const review = button("确认");
  expect(first.getAttribute("aria-current")).toBe("step");
  expect(
    document.getElementById(first.getAttribute("aria-describedby") ?? "")
      ?.textContent,
  ).toBe("填写名称");
  expect(button("不可用步骤").disabled).toBe(true);
  await act(async () => first.focus());
  await press(first, "ArrowRight");
  expect(document.activeElement).toBe(sections);
  expect(changes).toHaveLength(0);
  expect(first.getAttribute("aria-current")).toBe("step");
  await press(sections, "End");
  expect(document.activeElement).toBe(review);
  await press(review, "Home");
  expect(document.activeElement).toBe(first);
  await press(first, "ArrowLeft");
  expect(document.activeElement).toBe(review);
  await click(review);
  expect(changes).toEqual(["review"]);
  expect(review.getAttribute("aria-current")).toBe("step");
  expect(review.tabIndex).toBe(0);
  expect(first.tabIndex).toBe(-1);
  const descriptions = (first.getAttribute("aria-describedby") ?? "")
    .split(" ")
    .map((id) => document.getElementById(id)?.textContent);
  expect(descriptions).toEqual(["填写名称", "已完成"]);
});
