import { IqujiButton } from "@iquji-community/web-component";
import {
  createIqujiQueryClient,
  IqujiQueryProvider,
  iqujiQueryClientDefaults,
  isAuthorizationQueryError,
  shouldRetryIqujiQuery,
} from "@iquji-community/web-query";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import type { ComponentPreview } from "../catalog";
import { usePreviewText } from "../i18n/use-preview-text";

type Scenario = "success" | "temporary" | "authorization";

function QueryDemoContent() {
  const text = usePreviewText();
  const yesNo = (value: boolean | undefined) =>
    value ? text("是", "Yes") : text("否", "No");
  const [scenario, setScenario] = useState<Scenario>("success");
  const [version, setVersion] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const attemptRef = useRef(0);
  const query = useQuery({
    queryKey: ["preview-value", scenario, version],
    queryFn: async () => {
      const attempt = ++attemptRef.current;
      setAttempts(attempt);
      await new Promise((resolve) => setTimeout(resolve, 120));
      if (scenario === "authorization") {
        throw { status: 401 };
      }
      if (scenario === "temporary" && attempt < 3) {
        throw new Error("Temporary query failure");
      }
      return version + 1;
    },
  });

  const runScenario = (next: Scenario) => {
    attemptRef.current = 0;
    setAttempts(0);
    setScenario(next);
    setVersion((current) => current + 1);
  };
  const status = query.isPending
    ? text("查询中", "Querying")
    : query.isError
      ? text("查询失败（HTTP 401）", "Query failed (HTTP 401)")
      : text(
          `本地数据第 ${query.data} 版`,
          `Local data, revision ${query.data}`,
        );
  const refetchOnFocus =
    iqujiQueryClientDefaults.defaultOptions.queries.refetchOnWindowFocus;
  const isAuthError = isAuthorizationQueryError({ response: { status: 401 } });
  const retryAuthError = shouldRetryIqujiQuery(0, { status: 401 });
  return (
    <div className="catalog-preview-stack">
      <div className="catalog-preview-grid">
        <IqujiButton onClick={() => runScenario("success")} variant="secondary">
          {text("本地成功", "Local success")}
        </IqujiButton>
        <IqujiButton
          onClick={() => runScenario("temporary")}
          variant="secondary"
        >
          {text("临时错误后恢复", "Recover from a temporary error")}
        </IqujiButton>
        <IqujiButton
          onClick={() => runScenario("authorization")}
          variant="secondary"
        >
          {text("授权错误", "Authorization error")}
        </IqujiButton>
      </div>
      <p aria-live="polite" className="catalog-preview-value">
        {status}
      </p>
      <p className="catalog-preview-copy">
        {text(
          `尝试次数：${attempts}。聚焦窗口时刷新：${yesNo(refetchOnFocus)}。401 是授权错误：${yesNo(isAuthError)}。遇到 401 时重试：${yesNo(retryAuthError)}。`,
          `Attempts: ${attempts}. Refetch on window focus: ${yesNo(refetchOnFocus)}. Is HTTP 401 an authorization error? ${yesNo(isAuthError)}. Retry HTTP 401? ${yesNo(retryAuthError)}.`,
        )}
      </p>
    </div>
  );
}

function QueryDemo() {
  const client = useMemo(() => createIqujiQueryClient(), []);
  return (
    <IqujiQueryProvider client={client}>
      <QueryDemoContent />
    </IqujiQueryProvider>
  );
}

export const queryPreviews: readonly ComponentPreview[] = [
  {
    id: "query-client",
    name: "查询客户端与重试",
    packageId: "query",
    packageName: "@iquji-community/web-query",
    category: "查询",
    description: "使用本地 queryFn 操作成功、临时故障重试与不重试的授权错误。",
    keywords: "query client provider retry cache authorization local",
    render: () => <QueryDemo />,
  },
];
