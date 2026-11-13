import { IqujiButton } from "@iquji-cloud/web-component";
import {
  createIqujiQueryClient,
  IqujiQueryProvider,
  iqujiQueryClientDefaults,
  isAuthorizationQueryError,
  shouldRetryIqujiQuery,
} from "@iquji-cloud/web-query";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import type { ComponentPreview } from "../catalog";

type Scenario = "success" | "temporary" | "authorization";

function QueryDemoContent() {
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
        throw { status: 401, message: "本地模拟授权错误" };
      }
      if (scenario === "temporary" && attempt < 3) {
        throw new Error("本地临时错误");
      }
      return `本地数据 v${version + 1}`;
    },
  });

  const runScenario = (next: Scenario) => {
    attemptRef.current = 0;
    setAttempts(0);
    setScenario(next);
    setVersion((current) => current + 1);
  };
  const status = query.isPending
    ? "查询中"
    : query.isError
      ? `${query.error instanceof Error ? query.error.message : "HTTP 401"}（失败）`
      : query.data;
  return (
    <div className="catalog-preview-stack">
      <div className="catalog-preview-grid">
        <IqujiButton onClick={() => runScenario("success")} variant="secondary">
          本地成功
        </IqujiButton>
        <IqujiButton
          onClick={() => runScenario("temporary")}
          variant="secondary"
        >
          临时错误后恢复
        </IqujiButton>
        <IqujiButton
          onClick={() => runScenario("authorization")}
          variant="secondary"
        >
          授权错误
        </IqujiButton>
      </div>
      <p aria-live="polite" className="catalog-preview-value">
        {status}
      </p>
      <p className="catalog-preview-copy">
        本次请求 {attempts} 次；默认窗口聚焦刷新：
        {String(
          iqujiQueryClientDefaults.defaultOptions.queries.refetchOnWindowFocus,
        )}
        ； 401 识别为授权错误：
        {String(isAuthorizationQueryError({ response: { status: 401 } }))}； 401
        重试：{String(shouldRetryIqujiQuery(0, { status: 401 }))}。
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
    packageName: "@iquji-cloud/web-query",
    category: "查询",
    description: "使用本地 queryFn 操作成功、临时故障重试与不重试的授权错误。",
    keywords: "query client provider retry cache authorization local",
    render: () => <QueryDemo />,
  },
];
