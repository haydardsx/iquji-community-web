import {
  COMMUNITY_PACKAGES,
  type CommunityPackage,
  type ComponentPreview,
} from "../catalog";
import { basicPreviews } from "./basic";
import { editorPreviews } from "./editor";
import { feedbackPreviews } from "./feedback";
import { formPreviews } from "./forms";
import { i18nPreviews } from "./i18n";
import { iconPreviews } from "./icons";
import { layoutPreviews } from "./layout";
import { motionPreviews } from "./motion";
import { navigationPreviews } from "./navigation";
import { networkPreviews } from "./network";
import { notificationPreviews } from "./notifications";
import { overlayPreviews } from "./overlays";
import { queryPreviews } from "./query";
import { themePreviews } from "./theme";

export const componentPreviews: readonly ComponentPreview[] = [
  ...basicPreviews,
  ...formPreviews,
  ...navigationPreviews,
  ...feedbackPreviews,
  ...notificationPreviews,
  ...overlayPreviews,
  ...layoutPreviews,
  ...editorPreviews,
  ...i18nPreviews,
  ...iconPreviews,
  ...motionPreviews,
  ...networkPreviews,
  ...queryPreviews,
  ...themePreviews,
];

const packageIds = new Set<CommunityPackage>(
  componentPreviews.map((preview) => preview.packageId ?? "component"),
);
export const missingCommunityPreviewPackages = COMMUNITY_PACKAGES.filter(
  (packageId) => !packageIds.has(packageId),
);

if (missingCommunityPreviewPackages.length > 0) {
  throw new Error(
    `缺少 Community 预览: ${missingCommunityPreviewPackages.join(", ")}`,
  );
}
