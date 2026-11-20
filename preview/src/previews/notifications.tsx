import {
  IqujiButton,
  IqujiDialog,
  IqujiField,
  IqujiInput,
  IqujiNotificationProvider,
  useIqujiNotification,
} from "@iquji-community/web-component";
import { useIqujiLocale } from "@iquji-community/web-i18n";
import { useState } from "react";
import type { ComponentPreview } from "../catalog";
import { usePreviewText } from "../i18n/use-preview-text";

function NotificationDemo() {
  const text = usePreviewText();
  const notification = useIqujiNotification();
  const [dialogOpen, setDialogOpen] = useState(false);
  const toneLabels = {
    info: text("信息", "Info"),
    success: text("成功", "Success"),
    warning: text("警告", "Warning"),
    danger: text("错误", "Error"),
  };
  const buttons = (
    <div className="catalog-preview-grid">
      {(["info", "success", "warning", "danger"] as const).map((tone) => (
        <IqujiButton
          key={tone}
          variant="secondary"
          onClick={() =>
            notification.open({
              tone,
              title: {
                info: text("操作已提交", "Operation submitted"),
                success: text("配置已保存", "Configuration saved"),
                warning: text("需要检查配置", "Review configuration"),
                danger: text("连接失败", "Connection failed"),
              }[tone],
              description: text(
                "通知不会占据表单空间，悬停后暂停自动关闭。",
                "Hover over a notification to pause automatic dismissal.",
              ),
            })
          }
        >
          {toneLabels[tone]}
        </IqujiButton>
      ))}
      <IqujiButton
        variant="secondary"
        onClick={() => {
          notification.open({
            tone: "info",
            title: text("操作已提交", "Operation submitted"),
            description: text(
              "正在导出示例文档。",
              "Exporting the sample document.",
            ),
          });
          notification.open({
            tone: "success",
            title: text("导出完成", "Export complete"),
            description: text(
              "示例文档已就绪。",
              "The sample document is ready.",
            ),
          });
          notification.open({
            tone: "warning",
            title: text("缺少标题", "Missing title"),
            description: text("一份草稿尚未命名。", "One draft has no title."),
          });
        }}
      >
        {text("连续触发堆叠通知", "Stack notifications")}
      </IqujiButton>
      <IqujiButton
        variant="secondary"
        onClick={() =>
          notification.open({
            key: "configuration",
            duration: 0,
            title: text("配置等待确认", "Configuration awaits confirmation"),
            description: text(
              "再次点击会更新同一条常驻通知。",
              "Click again to update the same persistent notification.",
            ),
            actions: (
              <IqujiButton
                compact
                onClick={() => notification.close("configuration")}
              >
                {text("知道了", "Got it")}
              </IqujiButton>
            ),
          })
        }
      >
        {text("更新同一条通知", "Update one notification")}
      </IqujiButton>
      <IqujiButton variant="secondary" onClick={() => notification.close()}>
        {text("关闭全部", "Dismiss all")}
      </IqujiButton>
    </div>
  );
  return (
    <div className="catalog-preview-stack">
      {buttons}
      <IqujiButton variant="secondary" onClick={() => setDialogOpen(true)}>
        {text("在表单中查看通知", "View notifications in a form")}
      </IqujiButton>
      <IqujiDialog
        closeLabel={text("关闭表单", "Close form")}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={text("通知与表单", "Notifications in a form")}
      >
        <div className="catalog-preview-stack">
          <IqujiField
            description={text(
              "通知出现时保留当前输入焦点。",
              "The focused field stays active when a notification appears.",
            )}
            label={text("文档名称", "Document name")}
          >
            <IqujiInput defaultValue={text("示例文档", "Sample document")} />
          </IqujiField>
          {buttons}
        </div>
      </IqujiDialog>
    </div>
  );
}

function NotificationExample() {
  const text = usePreviewText();
  const { locale } = useIqujiLocale();
  return (
    <IqujiNotificationProvider
      key={locale}
      closeLabel={text("关闭通知", "Dismiss notification")}
      label={text("操作通知", "Operation notifications")}
    >
      <NotificationDemo />
    </IqujiNotificationProvider>
  );
}

export const notificationPreviews: readonly ComponentPreview[] = [
  {
    id: "notification",
    name: "IqujiNotificationProvider / useIqujiNotification",
    category: "反馈",
    description:
      "以浮动通知展示操作结果，支持自动关闭、按同一标识更新与操作按钮。",
    keywords: "通知 notification toast 成功 失败 表单",
    render: () => <NotificationExample />,
  },
];
