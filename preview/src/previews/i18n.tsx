import { IqujiButton } from "@iquji-community/web-component";
import {
  createTranslator,
  IQUJI_LOCALES,
  parseLocale,
  useIqujiLocale,
} from "@iquji-community/web-i18n";
import type { ComponentPreview } from "../catalog";
import { usePreviewText } from "../i18n/use-preview-text";

const catalogs = {
  "zh-CN": { greeting: "你好，{name}", total: "共 {count} 项" },
  "en-US": { greeting: "Hello, {name}", total: "{count} items" },
} as const;

function LocaleDemo() {
  const { locale, setLocale } = useIqujiLocale();
  const t = usePreviewText();
  const translate = createTranslator(catalogs[locale]);
  return (
    <div className="catalog-preview-stack">
      <div className="catalog-preview-grid">
        <IqujiButton
          onClick={() => setLocale(locale === "zh-CN" ? "en-US" : "zh-CN")}
          variant="secondary"
        >
          {t("切换预览语言", "Switch preview language")}
        </IqujiButton>
        <span className="catalog-preview-copy">
          {t("当前语言：简体中文", "Current language: English")}
        </span>
      </div>
      <p className="catalog-preview-value">
        {translate("greeting", { name: "Iquji" })}
      </p>
      <dl className="catalog-preview-copy">
        <dt>{t("识别语言标记", "Parse a locale tag")}</dt>
        <dd>
          <code>zh-Hant-TW</code> → {parseLocale("zh-Hant-TW")}
        </dd>
        <dt>{t("可用语言", "Available locales")}</dt>
        <dd>{IQUJI_LOCALES.join(t("、", ", "))}</dd>
        <dt>{t("模板插值", "Message interpolation")}</dt>
        <dd>{translate("total", { count: 3 })}</dd>
      </dl>
    </div>
  );
}

export const i18nPreviews: readonly ComponentPreview[] = [
  {
    id: "i18n-provider",
    name: "国际化状态",
    packageId: "i18n",
    packageName: "@iquji-community/web-i18n",
    category: "国际化",
    description: "切换预览语言，并查看语言识别和词典插值。",
    keywords: "i18n locale catalog translate interpolation",
    render: () => <LocaleDemo />,
  },
];
