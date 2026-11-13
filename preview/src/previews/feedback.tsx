import {
  IqujiAlert,
  IqujiAsyncStateFrame,
  IqujiBadge,
  IqujiProgressBar,
  IqujiSkeleton,
  IqujiTimeline,
} from "@iquji-cloud/web-component";
import type { ComponentPreview } from "../catalog";

export const feedbackPreviews: readonly ComponentPreview[] = [
  {
    id: "badge",
    name: "IqujiBadge",
    category: "反馈",
    description: "以轻量标签标注状态或分类。",
    keywords: "徽标 状态 标签",
    render: () => (
      <div className="catalog-preview-grid">
        <IqujiBadge>草稿</IqujiBadge>
        <IqujiBadge tone="info">进行中</IqujiBadge>
        <IqujiBadge tone="success">已完成</IqujiBadge>
        <IqujiBadge tone="warning">待确认</IqujiBadge>
        <IqujiBadge tone="danger">已阻塞</IqujiBadge>
      </div>
    ),
  },
  {
    id: "alert",
    name: "IqujiAlert",
    category: "反馈",
    description: "在内容附近呈现需要用户留意的信息。",
    keywords: "警告 提示 info success warning danger",
    render: () => (
      <div className="catalog-preview-stack">
        <IqujiAlert title="已保存" tone="success">
          最新更改已经同步到本地。
        </IqujiAlert>
        <IqujiAlert title="需要处理" tone="warning">
          有一项设置尚未完成。
        </IqujiAlert>
        <IqujiAlert title="无法连接" tone="danger">
          检查网络连接后重试。
        </IqujiAlert>
      </div>
    ),
  },
  {
    id: "progress-bar",
    name: "IqujiProgressBar",
    category: "反馈",
    description: "展示确定或不定进度，并保留正式进度语义。",
    keywords: "进度 进度条 progress",
    render: () => (
      <div className="catalog-preview-stack">
        <IqujiProgressBar label="确定进度" max={100} showValue value={42} />
        <IqujiProgressBar indeterminate label="正在执行" />
        <IqujiProgressBar label="完成" showValue tone="success" value={100} />
      </div>
    ),
  },
  {
    id: "timeline",
    name: "IqujiTimeline",
    category: "反馈",
    description: "用有序列表呈现任务步骤或审计时间线。",
    keywords: "时间线 步骤 历史 timeline",
    render: () => (
      <IqujiTimeline
        items={[
          { id: "one", title: "接收请求", timestamp: "10:00", tone: "info" },
          {
            id: "two",
            title: "执行任务",
            description: "Worker 已领取任务。",
            timestamp: "10:01",
            tone: "warning",
          },
          {
            id: "three",
            title: "任务完成",
            timestamp: "10:02",
            tone: "success",
          },
        ]}
        label="任务时间线"
      />
    ),
  },
  {
    id: "skeleton",
    name: "IqujiSkeleton",
    category: "反馈",
    description: "内容加载期间保持页面结构稳定。",
    keywords: "骨架 loading placeholder",
    render: () => (
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
    ),
  },
  {
    id: "async-state-frame",
    name: "IqujiAsyncStateFrame",
    category: "反馈",
    description: "统一包裹数据加载、空态、错误与刷新状态。",
    keywords: "异步 状态 loading empty error refreshing ready",
    render: () => (
      <div className="catalog-preview-grid catalog-state-demo">
        <IqujiAsyncStateFrame
          className="catalog-state-frame"
          emptyFallback={<span>暂无条目</span>}
          state="empty"
        >
          空状态
        </IqujiAsyncStateFrame>
        <IqujiAsyncStateFrame
          className="catalog-state-frame"
          errorFallback={<span>请求失败，请重试</span>}
          state="error"
        >
          错误状态
        </IqujiAsyncStateFrame>
        <IqujiAsyncStateFrame
          className="catalog-state-frame"
          loadingFallback={<span>正在读取数据…</span>}
          state="loading"
        >
          数据已就绪
        </IqujiAsyncStateFrame>
      </div>
    ),
  },
];
