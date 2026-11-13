import { afterEach, expect, mock, test } from "bun:test";
import { act, type ReactNode, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { IqujiOverlayProvider } from "./overlay-layer.js";
import { IqujiDialog } from "./overlays.js";
import {
  IqujiSearchDialog,
  type IqujiSearchDialogGroup,
} from "./search-dialog.js";

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
  if (value == null) throw new Error("测试中缺少实际搜索元素");
  return value;
}
const input = () =>
  required(document.querySelector<HTMLInputElement>('input[role="combobox"]'));
const dialog = () =>
  required(document.querySelector<HTMLElement>('[role="dialog"][data-open]'));
const options = () =>
  Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'));
const name = (element: Element) =>
  document.getElementById(element.getAttribute("aria-labelledby") ?? "")
    ?.textContent;
const option = (title: string) =>
  required(options().find((element) => name(element) === title));
const active = () =>
  document.getElementById(input().getAttribute("aria-activedescendant") ?? "");
const button = (label: string) =>
  required(
    Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(
      (element) =>
        element.textContent === label ||
        element.getAttribute("aria-label") === label,
    ),
  );
async function click(element: HTMLElement) {
  await act(async () => {
    element.focus();
    element.click();
    await tick();
  });
}
async function press(key: string, extra: KeyboardEventInit = {}) {
  await act(async () => {
    input().dispatchEvent(
      new KeyboardEvent("keydown", {
        key,
        bubbles: true,
        cancelable: true,
        ...extra,
      }),
    );
    await tick();
  });
}
async function fill(value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set?.call(input(), value);
    input().dispatchEvent(new Event("input", { bubbles: true }));
    await tick();
  });
}

const groups: readonly IqujiSearchDialogGroup[] = [
  {
    id: "documents",
    label: "文档",
    items: [
      {
        id: "alpha",
        title: "项目概述",
        description: "产品定位",
        keywords: "overview",
        icon: <span>D</span>,
        metadata: <time>10:20</time>,
      },
      { id: "disabled", title: "归档材料", disabled: true },
    ],
  },
  {
    id: "knowledge",
    label: "知识库",
    items: [
      {
        id: "beta",
        title: "审核规则",
        description: "人工确认边界",
        keywords: "REVIEW",
      },
      { id: "gamma", title: "发布流程", keywords: "release" },
    ],
  },
];

function Search({
  onSelect = () => {},
  data = groups,
}: {
  onSelect?(id: string): void;
  data?: readonly IqujiSearchDialogGroup[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        搜索
      </button>
      <IqujiSearchDialog
        open={open}
        onOpenChange={setOpen}
        title="查找项目内容"
        placeholder="搜索文档或知识"
        emptyLabel="没有匹配结果"
        closeLabel="关闭搜索"
        groups={data}
        onSelect={(id) => {
          onSelect(id);
          setOpen(false);
        }}
      />
    </>
  );
}

test("搜索输入初始聚焦，真实 Dialog.Title、分组和结果保留可访问命名", async () => {
  await render(<Search />);
  await click(button("搜索"));
  expect(document.activeElement).toBe(input());
  expect(name(dialog())).toBe("查找项目内容");
  expect(input().getAttribute("aria-label")).toBe("查找项目内容");
  expect(input().placeholder).toBe("搜索文档或知识");
  expect(
    document
      .getElementById(input().getAttribute("aria-controls") ?? "")
      ?.getAttribute("role"),
  ).toBe("listbox");
  expect(Array.from(dialog().querySelectorAll('[role="group"]'), name)).toEqual(
    ["文档", "知识库"],
  );
  expect(options().map(name)).toEqual([
    "项目概述",
    "归档材料",
    "审核规则",
    "发布流程",
  ]);
  expect(option("归档材料").getAttribute("aria-disabled")).toBe("true");
  expect(active()).toBe(option("项目概述"));
  expect(option("项目概述").textContent).toContain("10:20");
});

test("输入按标题、说明和关键词过滤，空分组隐藏且空结果移除活动引用", async () => {
  await render(<Search />);
  await click(button("搜索"));
  for (const [query, title] of [
    ["项目", "项目概述"],
    [" 人工确认 ", "审核规则"],
    ["review", "审核规则"],
    ["RELEASE", "发布流程"],
  ]) {
    await fill(required(query));
    expect(options().map(name)).toEqual([title]);
    expect(active()).toBe(option(required(title)));
    expect(dialog().querySelectorAll('[role="group"]')).toHaveLength(1);
  }
  await fill("不存在的内容");
  expect(options()).toHaveLength(0);
  expect(input().hasAttribute("aria-activedescendant")).toBe(false);
  expect(dialog().querySelector('[role="status"]')?.textContent).toBe(
    "没有匹配结果",
  );
  await fill("归档材料");
  expect(options()).toHaveLength(1);
  expect(input().hasAttribute("aria-activedescendant")).toBe(false);
  await press("Enter");
  expect(dialog()).not.toBeNull();
});

test("键盘跨组跳过禁用项，首尾和滚动定位一致，Enter选择后回到搜索入口", async () => {
  const selected = mock((_id: string) => {});
  await render(<Search onSelect={selected} />);
  const trigger = button("搜索");
  await click(trigger);
  await press("ArrowDown");
  expect(active()).toBe(option("审核规则"));
  await press("ArrowUp");
  expect(active()).toBe(option("项目概述"));
  const last = option("发布流程");
  const scroll = mock((_options?: ScrollIntoViewOptions | boolean) => {});
  last.scrollIntoView = scroll;
  await press("End");
  expect(active()).toBe(last);
  expect(scroll).toHaveBeenCalledWith({ block: "nearest" });
  await press("ArrowDown");
  expect(active()).toBe(option("项目概述"));
  await press("Home");
  expect(active()).toBe(option("项目概述"));
  await press("ArrowUp");
  expect(active()).toBe(last);
  expect(document.activeElement).toBe(input());
  await press("Enter");
  expect(selected).toHaveBeenCalledTimes(1);
  expect(selected).toHaveBeenCalledWith("gamma");
  expect(document.querySelector('[role="dialog"][data-open]')).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

test("鼠标活动项与键盘一致，禁用项不能点击提交", async () => {
  const selected = mock((_id: string) => {});
  await render(<Search onSelect={selected} />);
  await click(button("搜索"));
  await act(async () => {
    option("审核规则").dispatchEvent(
      new MouseEvent("mousemove", { bubbles: true }),
    );
    await tick();
  });
  expect(active()).toBe(option("审核规则"));
  await click(option("归档材料"));
  expect(selected).not.toHaveBeenCalled();
  expect(dialog()).not.toBeNull();
  await click(option("审核规则"));
  expect(selected).toHaveBeenCalledWith("beta");
  expect(document.querySelector('[role="dialog"][data-open]')).toBeNull();
});

test("Escape和明确关闭按钮恢复真实入口，重新打开清空上次查询", async () => {
  await render(<Search />);
  const trigger = button("搜索");
  await click(trigger);
  await fill("审核");
  await press("Escape");
  expect(document.querySelector('[role="dialog"][data-open]')).toBeNull();
  expect(document.activeElement).toBe(trigger);
  await click(trigger);
  expect(input().value).toBe("");
  expect(options()).toHaveLength(4);
  await fill("发布");
  await click(button("关闭搜索"));
  expect(document.activeElement).toBe(trigger);
  await click(trigger);
  expect(input().value).toBe("");
  expect(document.activeElement).toBe(input());
});

test("输入法组合期间不移动、提交或Escape关闭，确认组合结束后才提交", async () => {
  const selected = mock((_id: string) => {});
  await render(<Search onSelect={selected} />);
  await click(button("搜索"));
  await act(async () => {
    input().dispatchEvent(
      new CompositionEvent("compositionstart", { bubbles: true }),
    );
  });
  for (const key of ["ArrowDown", "ArrowUp", "Home", "End", "Enter", "Escape"])
    await press(key);
  expect(active()).toBe(option("项目概述"));
  expect(selected).not.toHaveBeenCalled();
  expect(dialog()).not.toBeNull();
  await act(async () => {
    input().dispatchEvent(
      new CompositionEvent("compositionend", { bubbles: true }),
    );
    await tick();
  });
  await press("Enter", { isComposing: true });
  await press("Enter", { keyCode: 229 });
  expect(selected).not.toHaveBeenCalled();
  await press("Enter");
  expect(selected).toHaveBeenCalledWith("alpha");
});

test("结果变化后保持仍有效的活动项，移除或禁用后重置到可选结果", async () => {
  let replace = (_groups: readonly IqujiSearchDialogGroup[]) => {};
  const selected = mock((_id: string) => {});
  function Dynamic() {
    const [data, setData] = useState(groups);
    replace = setData;
    return <Search data={data} onSelect={selected} />;
  }
  await render(<Dynamic />);
  await click(button("搜索"));
  await press("End");
  await act(async () => {
    replace([required(groups[1])]);
    await tick();
  });
  expect(active()).toBe(option("发布流程"));
  await act(async () => {
    replace([
      {
        id: "replacement",
        label: "当前结果",
        items: [{ id: "only", title: "当前唯一结果" }],
      },
    ]);
    await tick();
  });
  expect(active()).toBe(option("当前唯一结果"));
  await act(async () => {
    replace([
      {
        id: "replacement",
        label: "当前结果",
        items: [{ id: "only", title: "当前唯一结果", disabled: true }],
      },
    ]);
    await tick();
  });
  expect(input().hasAttribute("aria-activedescendant")).toBe(false);
  await press("Enter");
  expect(selected).not.toHaveBeenCalled();
});

test("搜索复用父层Dialog的层级，Escape只关闭搜索并恢复其父层入口", async () => {
  function Nested() {
    const [open, setOpen] = useState(false);
    return (
      <IqujiDialog open title="项目详情" closeLabel="关闭详情">
        <button type="button" onClick={() => setOpen(true)}>
          搜索项目
        </button>
        <IqujiSearchDialog
          open={open}
          onOpenChange={setOpen}
          title="搜索详情"
          placeholder="搜索"
          emptyLabel="无结果"
          closeLabel="关闭搜索"
          groups={groups}
          onSelect={() => {}}
        />
      </IqujiDialog>
    );
  }
  await render(<Nested />);
  const trigger = button("搜索项目");
  await click(trigger);
  expect(document.querySelectorAll('[role="dialog"][data-open]')).toHaveLength(
    2,
  );
  await press("Escape");
  expect(document.querySelectorAll('[role="dialog"][data-open]')).toHaveLength(
    1,
  );
  expect(document.activeElement).toBe(trigger);
});

test("结果选择只通知受控调用方，等待确认期间保留查询和输入焦点", async () => {
  const selected = mock((_id: string) => {});
  const changed = mock((_open: boolean) => {});
  await render(
    <IqujiSearchDialog
      open
      onOpenChange={changed}
      title="确认后再导航"
      placeholder="搜索"
      emptyLabel="无结果"
      closeLabel="关闭搜索"
      groups={groups}
      onSelect={selected}
    />,
  );
  await fill("REVIEW");
  const query = input();
  await press("Enter");
  expect(selected).toHaveBeenCalledWith("beta");
  expect(changed).not.toHaveBeenCalled();
  expect(dialog()).not.toBeNull();
  expect(input()).toBe(query);
  expect(input().value).toBe("REVIEW");
  expect(document.activeElement).toBe(query);
  await click(button("关闭搜索"));
  expect(changed).toHaveBeenCalledWith(false);
  expect(input().value).toBe("REVIEW");
});

test("选择后打开确认层不会被旧搜索抢焦点，取消确认回到原查询", async () => {
  function Guarded() {
    const [open, setOpen] = useState(false);
    const [confirm, setConfirm] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          打开待确认搜索
        </button>
        <IqujiSearchDialog
          open={open}
          onOpenChange={setOpen}
          title="带草稿搜索"
          placeholder="搜索"
          emptyLabel="无结果"
          closeLabel="关闭搜索"
          groups={groups}
          onSelect={() => setConfirm(true)}
        />
        <IqujiDialog
          open={confirm}
          onOpenChange={setConfirm}
          title="处理当前草稿"
          closeLabel="继续编辑"
        >
          <p>保留原搜索结果，先确认当前编辑。</p>
        </IqujiDialog>
      </>
    );
  }
  await render(<Guarded />);
  await click(button("打开待确认搜索"));
  await fill("审核");
  const query = input();
  await press("Enter");
  expect(document.querySelectorAll('[role="dialog"][data-open]')).toHaveLength(
    2,
  );
  expect(document.activeElement).toBe(button("继续编辑"));
  await click(button("继续编辑"));
  expect(document.querySelectorAll('[role="dialog"][data-open]')).toHaveLength(
    1,
  );
  expect(document.activeElement).toBe(query);
  expect(query.value).toBe("审核");
  expect(active()).toBe(option("审核规则"));
});
