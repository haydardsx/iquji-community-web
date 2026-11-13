import { IqujiButton } from "@iquji-web/web-component";
import {
  createTranslator,
  IQUJI_LOCALES,
  IqujiLocaleProvider,
  parseLocale,
  useIqujiLocale,
} from "@iquji-web/web-i18n";
import { useMemo } from "react";
import type { ComponentPreview } from "../catalog";

const catalogs = {
  "zh-CN": { greeting: "你好，{name}", status: "当前语言：中文" },
  "en-US": { greeting: "Hello, {name}", status: "Current locale: English" },
} as const;

function LocaleDemoContent() {
  const { locale, setLocale, translate } =
    useIqujiLocale<keyof (typeof catalogs)["zh-CN"]>();
  return (
    <div className="catalog-preview-stack">
      <div className="catalog-preview-grid">
        <IqujiButton
          onClick={() => setLocale(locale === "zh-CN" ? "en-US" : "zh-CN")}
          variant="secondary"
        >
          切换语言
        </IqujiButton>
        <span className="catalog-preview-copy">{translate("status")}</span>
      </div>
      <p className="catalog-preview-value">
        {translate("greeting", { name: "Iquji" })}
      </p>
      <p className="catalog-preview-copy">
        parseLocale("zh-Hant-TW")：{parseLocale("zh-Hant-TW") ?? "未识别"}；
        可用 locale：{IQUJI_LOCALES.join("、")}；独立 translator：
        {createTranslator({ total: "共 {count} 项" })("total", { count: 3 })}。
      </p>
    </div>
  );
}

function LocaleDemo() {
  const stableCatalogs = useMemo(() => catalogs, []);
  return (
    <IqujiLocaleProvider catalogs={stableCatalogs} defaultLocale="zh-CN">
      <LocaleDemoContent />
    </IqujiLocaleProvider>
  );
}

export const i18nPreviews: readonly ComponentPreview[] = [
  {
    id: "i18n-provider",
    name: "国际化状态",
    packageId: "i18n",
    packageName: "@iquji-web/web-i18n",
    category: "国际化",
    description: "切换 locale 并验证词典插值与 Provider 状态。",
    keywords: "i18n locale catalog translate interpolation",
    render: () => <LocaleDemo />,
  },
];
