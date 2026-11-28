import {
  IqujiAlert,
  IqujiAsyncStateFrame,
  IqujiBadge,
  IqujiDiagnosticBanner,
  type IqujiLogEntry,
  IqujiLogViewer,
  IqujiPopover,
  IqujiProgressBar,
  IqujiSkeleton,
  IqujiTag,
  IqujiTimeline,
  parseLogLine,
} from "@iquji-community/web-component";
import { useIqujiLocale } from "@iquji-community/web-i18n";
import { useState } from "react";
import type { ComponentPreview } from "../catalog";
import { usePreviewText } from "../i18n/use-preview-text";

function BadgeDemo() {
  const text = usePreviewText();
  return (
    <div className="catalog-preview-grid">
      <IqujiBadge>{text("草稿", "Draft")}</IqujiBadge>
      <IqujiBadge tone="info">{text("进行中", "In progress")}</IqujiBadge>
      <IqujiBadge tone="success">{text("已完成", "Complete")}</IqujiBadge>
      <IqujiBadge tone="warning">{text("待确认", "Pending review")}</IqujiBadge>
      <IqujiBadge tone="danger">{text("已阻塞", "Blocked")}</IqujiBadge>
    </div>
  );
}

function TagDemo() {
  const text = usePreviewText();
  const [selected, setSelected] = useState(true);
  return (
    <div className="catalog-preview-grid">
      <IqujiTag>{text("默认标签", "Default")}</IqujiTag>
      <IqujiTag tone="info" variant="outline">
        {text("只读", "Read-only")}
      </IqujiTag>
      <IqujiTag onSelectedChange={setSelected} selected={selected}>
        {text("可选中标签", "Selectable")}
      </IqujiTag>
      <IqujiPopover
        trigger={
          <IqujiTag interactive>{text("查看版本", "View version")}</IqujiTag>
        }
      >
        <p className="catalog-preview-copy">
          {text("当前文档为已发布版本。", "This document is published.")}
        </p>
      </IqujiPopover>
    </div>
  );
}

function AlertDemo() {
  const text = usePreviewText();
  return (
    <div className="catalog-preview-stack">
      <IqujiAlert title={text("已保存", "Saved")} tone="success">
        {text(
          "最新更改已经同步到本地。",
          "Your latest changes are saved locally.",
        )}
      </IqujiAlert>
      <IqujiAlert title={text("需要处理", "Action required")} tone="warning">
        {text("有一项设置尚未完成。", "One setting still needs attention.")}
      </IqujiAlert>
      <IqujiAlert
        title={text("无法连接", "Connection unavailable")}
        tone="danger"
      >
        {text("检查网络连接后重试。", "Check the connection and try again.")}
      </IqujiAlert>
      <IqujiDiagnosticBanner
        description={text(
          "请先选择导出格式。",
          "Choose an export format to continue.",
        )}
        title={text("导出设置待补充", "Export settings incomplete")}
        tone="warning"
      />
    </div>
  );
}

function ProgressDemo() {
  const text = usePreviewText();
  return (
    <div className="catalog-preview-stack">
      <IqujiProgressBar
        label={text("确定进度", "Determinate progress")}
        max={100}
        showValue
        value={42}
      />
      <IqujiProgressBar indeterminate label={text("正在执行", "Working")} />
      <IqujiProgressBar
        label={text("完成", "Complete")}
        showValue
        tone="success"
        value={100}
      />
    </div>
  );
}

function TimelineDemo() {
  const text = usePreviewText();
  return (
    <IqujiTimeline
      items={[
        {
          id: "one",
          title: text("接收请求", "Request received"),
          timestamp: "10:00",
          tone: "info",
        },
        {
          id: "two",
          title: text("执行任务", "Processing task"),
          description: text("任务已开始执行。", "The task has started."),
          timestamp: "10:01",
          tone: "warning",
        },
        {
          id: "three",
          title: text("任务完成", "Task complete"),
          timestamp: "10:02",
          tone: "success",
        },
      ]}
      label={text("任务时间线", "Task timeline")}
    />
  );
}

function SkeletonDemo() {
  return (
    <div className="catalog-preview-stack catalog-skeleton-demo">
      <IqujiSkeleton height={18} width="38%" />
      <IqujiSkeleton height={12} width="78%" />
      <IqujiSkeleton height={12} width="64%" />
      <div className="catalog-preview-grid">
        <IqujiSkeleton height={72} shape="block" width={96} />
        <IqujiSkeleton height={72} shape="block" width={96} />
        <IqujiSkeleton height={72} shape="block" width={96} />
      </div>
    </div>
  );
}

function AsyncStateDemo() {
  const text = usePreviewText();
  return (
    <div className="catalog-preview-grid catalog-state-demo">
      <IqujiAsyncStateFrame
        className="catalog-state-frame"
        emptyFallback={<span>{text("暂无条目", "No items")}</span>}
        state="empty"
      >
        {text("空状态", "Empty")}
      </IqujiAsyncStateFrame>
      <IqujiAsyncStateFrame
        className="catalog-state-frame"
        errorFallback={
          <span>{text("请求失败，请重试", "Request failed. Try again.")}</span>
        }
        state="error"
      >
        {text("错误状态", "Error")}
      </IqujiAsyncStateFrame>
      <IqujiAsyncStateFrame
        className="catalog-state-frame"
        loadingFallback={<span>{text("正在读取数据…", "Loading data…")}</span>}
        state="loading"
      >
        {text("数据已就绪", "Data ready")}
      </IqujiAsyncStateFrame>
    </div>
  );
}

function LogDemo() {
  const { locale } = useIqujiLocale();
  const text = usePreviewText();
  const [refreshed, setRefreshed] = useState(false);
  const logs: IqujiLogEntry[] = [
    {
      ...parseLogLine("2000-01-01T10:00:00Z info", 0),
      source: text("文档", "Document"),
      phase: text("校验", "validation"),
      message: text("已读取示例文档。", "The sample document was read."),
    },
    {
      timestamp: "2000-01-01T10:00:01Z",
      level: "warn",
      source: text("文档", "Document"),
      phase: text("校验", "validation"),
      message: text("未填写可选标题。", "The optional title is missing."),
    },
    {
      timestamp: "2000-01-01T10:00:02Z",
      level: "error",
      source: text("文档", "Document"),
      phase: text("导出", "export"),
      message: text(
        "示例文档的导出尚未完成。",
        "The sample document could not be exported.",
      ),
    },
  ];
  if (refreshed) {
    logs.push({
      timestamp: "2000-01-01T10:00:03Z",
      level: "info",
      source: text("文档", "Document"),
      phase: text("刷新", "refresh"),
      message: text(
        "已读取最新的示例条目。",
        "The latest sample entry was loaded.",
      ),
    });
  }
  return (
    <div className="catalog-preview-stack" style={{ width: "100%" }}>
      <IqujiLogViewer
        label={text("示例日志", "Sample logs")}
        locale={locale}
        logs={logs}
        maxHeight={260}
        onRefresh={() => setRefreshed(true)}
      />
    </div>
  );
}

export const feedbackPreviews: readonly ComponentPreview[] = [
  {
    id: "badge",
    name: "IqujiBadge",
    category: "反馈",
    description: "以轻量标签标注状态或分类。",
    keywords: "徽标 状态 标签",
    render: () => <BadgeDemo />,
  },
  {
    id: "tag",
    name: "IqujiTag",
    category: "反馈",
    description: "支持静态展示、点选切换以及弹层触发器的轻量标签。",
    keywords: "标签 tag chip 可选中",
    render: () => <TagDemo />,
  },
  {
    id: "alert",
    name: "IqujiAlert",
    category: "反馈",
    description: "在内容附近呈现需要用户留意的信息。",
    keywords: "警告 提示 info success warning danger",
    render: () => <AlertDemo />,
  },
  {
    id: "progress-bar",
    name: "IqujiProgressBar",
    category: "反馈",
    description: "展示确定或不定进度，并保留正式进度语义。",
    keywords: "进度 进度条 progress",
    render: () => <ProgressDemo />,
  },
  {
    id: "timeline",
    name: "IqujiTimeline",
    category: "反馈",
    description: "用有序列表呈现任务步骤或审计时间线。",
    keywords: "时间线 步骤 历史 timeline",
    render: () => <TimelineDemo />,
  },
  {
    id: "skeleton",
    name: "IqujiSkeleton",
    category: "反馈",
    description: "内容加载期间保持页面结构稳定。",
    keywords: "骨架 loading placeholder",
    render: () => <SkeletonDemo />,
  },
  {
    id: "async-state-frame",
    name: "IqujiAsyncStateFrame",
    category: "反馈",
    description: "统一包裹数据加载、空态、错误与刷新状态。",
    keywords: "异步 状态 loading empty error refreshing ready",
    render: () => <AsyncStateDemo />,
  },
  {
    id: "log-viewer",
    name: "IqujiLogViewer",
    category: "反馈",
    description:
      "专业终端控制台风格的日志查看与排障工具，支持行号、等级筛选与关键词高亮。",
    keywords: "日志 查看器 log viewer terminal console diagnostic banner",
    render: () => <LogDemo />,
  },
];
