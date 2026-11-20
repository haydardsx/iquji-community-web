import { afterEach, expect, test } from "bun:test";
import { fileURLToPath } from "node:url";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { IqujiLogViewer, parseLogLine } from "./log-viewer.js";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const injectedStyles: HTMLStyleElement[] = [];

afterEach(() => {
  for (const style of injectedStyles.splice(0)) style.remove();
  delete document.documentElement.dataset.theme;
  document.body.replaceChildren();
});

async function applyStyles(specifier: string) {
  const result = await Bun.build({
    entrypoints: [fileURLToPath(import.meta.resolve(specifier))],
    target: "browser",
  });
  if (!result.success || !result.outputs[0]) {
    throw new AggregateError(result.logs, "样式出口构建失败");
  }
  const style = document.createElement("style");
  style.textContent = await result.outputs[0].text();
  document.head.append(style);
  injectedStyles.push(style);
}

test("parseLogLine 正确解析带 ISO 时间戳与级别的日志行", () => {
  const line =
    "2000-01-01T10:00:00.000001Z info document read sample document was read";
  const parsed = parseLogLine(line, 0);
  expect(parsed.timestamp).toBe("2000-01-01T10:00:00.000001Z");
  expect(parsed.level).toBe("info");
  expect(parsed.source).toBe("document");
  expect(parsed.phase).toBe("read");
  expect(parsed.message).toBe("sample document was read");
});

test("parseLogLine 正确识别 error 级别的故障日志行", () => {
  const line =
    "2000-01-01T10:00:02.000002Z info worker complete 示例文档导出失败。";
  const parsed = parseLogLine(line, 1);
  expect(parsed.level).toBe("error");
  expect(parsed.message).toContain("示例文档导出失败");
});

test("IqujiLogViewer 渲染日志行数、级别徽标与空状态", () => {
  const logs = [
    "2000-01-01T10:00:00.000001Z info document read sample document was read",
    "2000-01-01T10:00:02.000002Z info worker complete 示例文档导出失败",
  ];
  const markup = renderToStaticMarkup(
    <IqujiLogViewer label="测试日志" logs={logs} />,
  );
  const parsedDocument = new DOMParser().parseFromString(markup, "text/html");

  const region = parsedDocument.querySelector(".iquji-log-viewer");
  expect(region?.getAttribute("aria-label")).toBe("测试日志");

  const lines = parsedDocument.querySelectorAll(".iquji-log-viewer__line");
  expect(lines.length).toBe(2);

  // 包含错误行
  const errLine = parsedDocument.querySelector(
    '.iquji-log-viewer__line[data-level="error"]',
  );
  expect(errLine).toBeTruthy();
  expect(errLine?.textContent).toContain("示例文档导出失败");
});

test("IqujiLogViewer 的英文界面包含本地化的搜索、筛选与统计", () => {
  const markup = renderToStaticMarkup(
    <IqujiLogViewer
      locale="en-US"
      logs={[{ level: "error", message: "Sample export failed" }]}
      onRefresh={() => {}}
    />,
  );
  const parsedDocument = new DOMParser().parseFromString(markup, "text/html");
  expect(parsedDocument.querySelector('[aria-label="Log viewer"]')).toBeTruthy();
  expect(parsedDocument.querySelector('[aria-label="Search logs"]')).toBeTruthy();
  expect(parsedDocument.querySelector('[aria-label="Refresh"]')).toBeTruthy();
  expect(parsedDocument.body.textContent).toContain("All (1)");
  expect(parsedDocument.body.textContent).toContain("1 entry");
  expect(parsedDocument.body.textContent).toContain("1 error");
  expect(parsedDocument.body.textContent).not.toMatch(/\p{Script=Han}/u);
});

test("IqujiLogViewer 支持结构化条目与自定义空状态", () => {
  const emptyMarkup = renderToStaticMarkup(
    <IqujiLogViewer emptyLabel="当前无任何日志流" logs={[]} />,
  );
  expect(emptyMarkup).toContain("当前无任何日志流");

  const structuredMarkup = renderToStaticMarkup(
    <IqujiLogViewer
      logs={[
        {
          id: "item-1",
          level: "warn",
          message: "内存使用率超过阈值",
          source: "monitor",
          timestamp: "2000-01-01 10:00:00",
        },
      ]}
    />,
  );
  expect(structuredMarkup).toContain("WARN");
  expect(structuredMarkup).toContain("内存使用率超过阈值");
});

test("IqujiLogViewer 支持错误诊断触发器与标签槽位严格纵向对齐", () => {
  const markup = renderToStaticMarkup(
    <IqujiLogViewer
      error={{
        code: "SAMPLE_EXPORT_FAILED",
        message: "请检查示例文档的导出选项。",
        title: "操作未完成",
      }}
      logs={[
        "2000-01-01T10:00:00.000003Z info document read sample document was read",
        "2000-01-01T10:00:01.000004Z info document export 正在读取示例导出选项",
      ]}
    />,
  );
  const parsedDocument = new DOMParser().parseFromString(markup, "text/html");

  const errTrigger = parsedDocument.querySelector(
    ".iquji-log-viewer__error-trigger",
  );
  expect(errTrigger).toBeTruthy();
  expect(errTrigger?.textContent).toContain("操作未完成");

  const tagSlots = parsedDocument.querySelectorAll(
    ".iquji-log-viewer__tag-slot",
  );
  expect(tagSlots.length).toBe(2);
  expect(
    parsedDocument.querySelector(".iquji-log-viewer__tag")?.textContent,
  ).toBe("document read");
});

test("IqujiLogViewer 内置刷新按钮与工具栏风格统一且响应刷新状态", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  let refreshed = 0;

  try {
    await act(async () => {
      root.render(
        createElement(IqujiLogViewer, {
          logs: ["2000-01-01T10:00:00Z info document ready 示例文档已就绪"],
          onRefresh: () => {
            refreshed += 1;
          },
          refreshLabel: "刷新日志",
        }),
      );
    });

    const refreshBtn = host.querySelector<HTMLButtonElement>(
      '.iquji-log-viewer__toolbar-right button[aria-label="刷新日志"]',
    );
    expect(refreshBtn).toBeTruthy();
    expect(refreshBtn?.classList.contains("iquji-log-viewer__tool-btn")).toBe(
      true,
    );
    expect(refreshBtn?.disabled).toBe(false);

    await act(async () => {
      refreshBtn?.click();
    });
    expect(refreshed).toBe(1);

    await act(async () => {
      root.render(
        createElement(IqujiLogViewer, {
          logs: ["2000-01-01T10:00:00Z info document ready 示例文档已就绪"],
          onRefresh: () => {
            refreshed += 1;
          },
          refreshLabel: "刷新日志",
          refreshing: true,
        }),
      );
    });

    expect(refreshBtn?.disabled).toBe(true);
    expect(refreshBtn?.getAttribute("data-refreshing")).toBe("true");
    expect(refreshBtn?.getAttribute("aria-busy")).toBe("true");
  } finally {
    await act(async () => root.unmount());
  }
});

test("IqujiLogViewer 与异常气泡在日间与夜间主题下正确切换配色变量", async () => {
  await applyStyles("@iquji-community/web-theme/tokens.css");
  await applyStyles("@iquji-community/web-component/styles.css");

  const readThemeTokens = (theme: "light" | "dark") => {
    document.documentElement.dataset.theme = theme;
    const viewer = document.createElement("div");
    viewer.className = "iquji-log-viewer";
    const popover = document.createElement("div");
    popover.className = "iquji-log-viewer__error-popover";
    document.body.append(viewer, popover);
    const viewerStyle = getComputedStyle(viewer);
    const popoverStyle = getComputedStyle(popover);
    const snapshot = {
      bg: viewerStyle.getPropertyValue("--iquji-log-bg").trim(),
      popoverTitle: popoverStyle
        .getPropertyValue("--iquji-log-popover-title")
        .trim(),
      text: viewerStyle.getPropertyValue("--iquji-log-text").trim(),
    };
    viewer.remove();
    popover.remove();
    return snapshot;
  };

  const light = readThemeTokens("light");
  const dark = readThemeTokens("dark");

  expect(light.bg).not.toBe(dark.bg);
  expect(light.text).not.toBe(dark.text);
  expect(dark.bg).toBe("#101216");
  expect(light.popoverTitle).not.toBe(dark.popoverTitle);
  expect(dark.popoverTitle).toBe("#fca5a5");
});
