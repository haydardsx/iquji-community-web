import { lazy, Suspense, useState } from "react";
import type { ComponentPreviewId } from "./catalog";

const LiveExample = lazy(() => import("./LiveExample"));

export default function Example({
  id,
  language,
}: {
  id: ComponentPreviewId;
  language: "en" | "zh";
}) {
  const [open, setOpen] = useState(false);
  return (
    <details onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>{language === "en" ? "Try the example" : "试用示例"}</summary>
      {open && (
        <Suspense
          fallback={<p>{language === "en" ? "Loading…" : "载入中…"}</p>}
        >
          <LiveExample id={id} language={language} />
        </Suspense>
      )}
    </details>
  );
}
