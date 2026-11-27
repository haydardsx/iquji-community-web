import { IqujiIcon } from "@iquji-community/web-icons";
import { BrowserOnly } from "@rspress/core/runtime";
import { lazy, type ReactNode } from "react";
import type { ComponentPreviewId } from "./catalog";

const LiveExample = lazy(() => import("./LiveExample"));

export default function Example({
  id,
  language,
  children,
}: {
  id: ComponentPreviewId;
  language: "en" | "zh";
  children: ReactNode;
}) {
  return (
    <div className="guide-example" data-example={id}>
      <div className="guide-example__preview rp-not-doc">
        <BrowserOnly
          fallback={
            <p className="guide-example__loading" role="status">
              {language === "en" ? "Loading preview…" : "正在载入预览…"}
            </p>
          }
        >
          {() => <LiveExample id={id} language={language} />}
        </BrowserOnly>
      </div>
      <details className="guide-example__source">
        <summary>
          <IqujiIcon decorative name="code" size={16} />
          {language === "en" ? "View code" : "查看代码"}
          <IqujiIcon decorative name="chevron-down" size={15} />
        </summary>
        {children}
      </details>
    </div>
  );
}
