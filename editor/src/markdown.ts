import DOMPurify from "dompurify";
import { marked, Renderer } from "marked";

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] ?? character,
  );

/** 原始 HTML 作为文字展示；打开文件不执行嵌入内容或请求远程图片。 */
export function renderEditorMarkdown(value: string): string {
  const renderer = new Renderer();
  renderer.html = ({ text }) => escapeHtml(text);
  renderer.image = ({ text }) => escapeHtml(text);
  renderer.link = ({ href, tokens }) => {
    const label = renderer.parser.parseInline(tokens);
    if (
      !/^(https?:\/\/|mailto:|#)/i.test(href) ||
      [...href].some((character) => character.charCodeAt(0) <= 32)
    )
      return label;
    return `<a href="${escapeHtml(href)}" rel="noopener noreferrer">${label}</a>`;
  };
  const html = marked.parse(value, { async: false, gfm: true, renderer });
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: [
      "img",
      "iframe",
      "object",
      "embed",
      "style",
      "input",
      "form",
      "video",
      "audio",
    ],
    FORBID_ATTR: ["style", "src", "srcset"],
  });
}
