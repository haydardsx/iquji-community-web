import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { IqujiDiagnosticBanner } from "./diagnostic.js";

test("IqujiDiagnosticBanner 渲染错误标题、说明与错误码", () => {
  const markup = renderToStaticMarkup(
    <IqujiDiagnosticBanner
      description="示例文档导出失败。请查看诊断日志。"
      errorCode="SAMPLE_EXPORT_FAILED"
      title="操作未完成"
      tone="danger"
    />,
  );
  const document = new DOMParser().parseFromString(markup, "text/html");

  const alert = document.querySelector(".iquji-diagnostic-banner");
  expect(alert?.getAttribute("role")).toBe("alert");
  expect(alert?.getAttribute("data-tone")).toBe("danger");
  expect(
    document.querySelector(".iquji-diagnostic-banner__title")?.textContent,
  ).toBe("操作未完成");
  expect(
    document.querySelector(".iquji-diagnostic-banner__desc")?.textContent,
  ).toContain("示例文档导出失败");
  expect(
    document.querySelector(".iquji-diagnostic-banner__code")?.textContent,
  ).toContain("SAMPLE_EXPORT_FAILED");
});
