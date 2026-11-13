import {
  IqujiButton,
  IqujiDialog,
  IqujiField,
  IqujiInput,
  IqujiNotificationProvider,
  useIqujiNotification,
} from "@iquji-web/web-component";
import { useState } from "react";
import type { ComponentPreview } from "../catalog";

function NotificationDemo() {
  const notification = useIqujiNotification();
  const [dialogOpen, setDialogOpen] = useState(false);
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
                info: "操作已提交",
                success: "配置已保存",
                warning: "需要检查配置",
                danger: "连接失败",
              }[tone],
              description: "通知不会占据表单空间，悬停后暂停自动关闭。",
            })
          }
        >
          {tone}
        </IqujiButton>
      ))}
      <IqujiButton
        variant="secondary"
        onClick={() =>
          notification.open({
            key: "configuration",
            duration: 0,
            title: "配置等待确认",
            description: "再次点击会更新同一条常驻通知。",
            actions: (
              <IqujiButton
                compact
                onClick={() => notification.close("configuration")}
              >
                知道了
              </IqujiButton>
            ),
          })
        }
      >
        更新同一条通知
      </IqujiButton>
      <IqujiButton variant="secondary" onClick={() => notification.close()}>
        关闭全部
      </IqujiButton>
    </div>
  );
  return (
    <div className="catalog-preview-stack">
      {buttons}
      <IqujiButton variant="secondary" onClick={() => setDialogOpen(true)}>
        在表单中查看通知
      </IqujiButton>
      <IqujiDialog
        closeLabel="关闭表单"
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="通知与表单"
      >
        <div className="catalog-preview-stack">
          <IqujiField
            description="通知出现时保留当前输入焦点。"
            label="服务器名称"
          >
            <IqujiInput defaultValue="生产服务器" />
          </IqujiField>
          {buttons}
        </div>
      </IqujiDialog>
    </div>
  );
}

export const notificationPreviews: readonly ComponentPreview[] = [
  {
    id: "notification",
    name: "IqujiNotificationProvider / useIqujiNotification",
    category: "反馈",
    description:
      "以浮动通知展示操作结果，支持自动关闭、同 key 更新与操作按钮。",
    keywords: "通知 notification toast 成功 失败 表单",
    render: () => (
      <IqujiNotificationProvider closeLabel="关闭通知" label="操作通知">
        <NotificationDemo />
      </IqujiNotificationProvider>
    ),
  },
];
