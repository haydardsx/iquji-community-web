import { useIqujiLocale } from "@iquji-community/web-i18n";

const chineseText = (chinese: string, _english: string) => chinese;
const englishText = (_chinese: string, english: string) => english;

export function usePreviewText() {
  const { locale } = useIqujiLocale();
  return locale === "zh-CN" ? chineseText : englishText;
}
