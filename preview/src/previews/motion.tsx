import { IqujiButton } from "@iquji-web/web-component";
import {
  IqujiMotion,
  IqujiMotionProvider,
  iqujiMotionDuration,
  iqujiMotionEasing,
  iqujiMotionPresets,
  iqujiMotionVariants,
} from "@iquji-web/web-motion";
import { useState } from "react";
import type { ComponentPreview } from "../catalog";

function MotionDemo() {
  const [visible, setVisible] = useState(true);
  return (
    <IqujiMotionProvider>
      <div className="catalog-preview-stack">
        <IqujiButton
          onClick={() => setVisible((current) => !current)}
          variant="secondary"
        >
          {visible ? "隐藏元素" : "显示元素"}
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
          reduced-motion 会由 Provider 交给用户偏好处理。
        </IqujiMotion.div>
        <p className="catalog-preview-copy">
          控件时长 {iqujiMotionDuration.control}s；覆盖层时长{" "}
          {iqujiMotionDuration.overlay}s； 标准曲线 cubic-bezier(
          {iqujiMotionEasing.standard.join(", ")})。
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
    packageName: "@iquji-web/web-motion",
    category: "动效",
    description: "使用统一动效 Provider 和 motion 组件切换进入状态。",
    keywords: "motion animation reduced motion provider",
    render: () => <MotionDemo />,
  },
];
