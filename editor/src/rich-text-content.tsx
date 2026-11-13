import { type EditorContentProps, PureEditorContent } from "@tiptap/react";
import { useMemo } from "react";

class MountedEditorContent extends PureEditorContent {
  private mounted = false;
  private pending = false;

  override componentDidMount() {
    this.mounted = true;
    this.scheduleInitialization();
  }

  override componentDidUpdate() {
    this.scheduleInitialization();
  }

  override componentWillUnmount() {
    this.mounted = false;
    super.componentWillUnmount();
  }

  private scheduleInitialization() {
    if (this.pending) return;
    this.pending = true;
    // 等旧 EditorContent 清理后再接管同一编辑器，避开 NodeView 的 flushSync 与 React 提交阶段冲突。
    queueMicrotask(() => {
      this.pending = false;
      if (!this.mounted) return;
      const initialized = this.initialized;
      this.init();
      // 新容器首轮可能读到旧 portal store，init 建立新 store 后需要重新订阅。
      if (!initialized && this.initialized) this.forceUpdate();
    });
  }
}

export function IqujiRichTextContent(props: Omit<EditorContentProps, "ref">) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: 编辑器实例切换时必须重建 portal 容器。
  const key = useMemo(() => crypto.randomUUID(), [props.editor]);
  return <MountedEditorContent key={key} {...props} />;
}
