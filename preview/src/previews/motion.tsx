import { IqujiButton } from "@iquji-community/web-component";
import {
  IqujiMotion,
  IqujiMotionProvider,
  iqujiMotionDuration,
  iqujiMotionEasing,
  iqujiMotionPresets,
  iqujiMotionVariants,
} from "@iquji-community/web-motion";
import { useState } from "react";
import type { ComponentPreview } from "../catalog";
import { usePreviewText } from "../i18n/use-preview-text";

function MotionDemo() {
  const text = usePreviewText();
  const [visible, setVisible] = useState(true);
  return (
    <IqujiMotionProvider>
      <div className="catalog-preview-stack">
        <IqujiButton
          onClick={() => setVisible((current) => !current)}
          variant="secondary"
        >
          {visible
            ? text("隐藏元素", "Hide element")
            : text("显示元素", "Show element")}
        </IqujiButton>
        <IqujiMotion.div
          animate={
            visible
              ? iqujiMotionVariants.item.enter
              : iqujiMotionVariants.item.initial
          }
          className="catalog-motion-demo"
          initial={iqujiMotionVariants.item.initial}
          transition={iqujiMotionPresets.route}
        >
          {text(
            "动效遵循系统的减少动态效果偏好。",
            "Motion respects the system’s reduced-motion preference.",
          )}
        </IqujiMotion.div>
        <p className="catalog-preview-copy">
          {text(
            `控件时长 ${iqujiMotionDuration.control} 秒，浮层时长 ${iqujiMotionDuration.overlay} 秒。`,
            `Control duration: ${iqujiMotionDuration.control}s. Overlay duration: ${iqujiMotionDuration.overlay}s.`,
          )}{" "}
          {text("标准缓动曲线", "Standard easing")}{" "}
          <code>cubic-bezier({iqujiMotionEasing.standard.join(", ")})</code>.
        </p>
      </div>
    </IqujiMotionProvider>
  );
}

export const motionPreviews: readonly ComponentPreview[] = [
  {
    id: "motion-provider",
    name: "动效与 reduced-motion",
    packageId: "motion",
    packageName: "@iquji-community/web-motion",
    category: "动效",
    description: "使用统一动效 Provider 和 motion 组件切换进入状态。",
    keywords: "motion animation reduced motion provider",
    render: () => <MotionDemo />,
  },
];
