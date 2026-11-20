import {
  formatCalendarDate,
  IqujiCalendar,
  IqujiCheckbox,
  IqujiColorPicker,
  IqujiDatePicker,
  IqujiEmojiPicker,
  IqujiField,
  IqujiInput,
  IqujiMultiSelect,
  IqujiRadio,
  IqujiSegmentedControl,
  IqujiSelect,
  IqujiSwitch,
  IqujiTextarea,
  normalizeIqujiColor,
  parseCalendarDate,
} from "@iquji-community/web-component";
import { useIqujiLocale } from "@iquji-community/web-i18n";
import { useState } from "react";
import type { ComponentPreview } from "../catalog";
import { usePreviewText } from "../i18n/use-preview-text";

function FieldPreview() {
  const text = usePreviewText();
  return (
    <div className="catalog-preview-stack">
      <IqujiField
        description={text(
          "用于通知与登录验证。",
          "Used for notifications and sign-in verification.",
        )}
        label={text("联系邮箱", "Contact email")}
        required
      >
        <IqujiInput defaultValue="hello@example.com" type="email" />
      </IqujiField>
      <IqujiField
        error={text("请输入有效的邮箱地址。", "Enter a valid email address.")}
        label={text("备用邮箱", "Backup email")}
      >
        <IqujiInput defaultValue="not-an-email" type="email" />
      </IqujiField>
      <IqujiField
        description={text(
          "只读字段仍允许选中和复制。",
          "You can select and copy a read-only value.",
        )}
        label={text("服务器标识", "Server ID")}
      >
        <IqujiInput value="sample-server-01" readOnly />
      </IqujiField>
      <IqujiField label={text("暂不可编辑", "Editing unavailable")}>
        <IqujiInput
          value={text("等待连接就绪", "Waiting for a connection")}
          disabled
        />
      </IqujiField>
    </div>
  );
}

function InputPreview() {
  const text = usePreviewText();
  const [value, setValue] = useState("");
  return (
    <div className="catalog-preview-stack">
      <IqujiField
        description={text(
          "输入内容会即时显示。",
          "Your input appears as you type.",
        )}
        label={text("项目名称", "Project name")}
      >
        <IqujiInput
          onChange={(event) => setValue(event.currentTarget.value)}
          placeholder={text("例如：示例项目", "For example, Sample project")}
          value={value}
        />
      </IqujiField>
      <p className="catalog-preview-copy" aria-live="polite">
        {text("当前值：", "Current value: ")}
        {value || text("尚未输入", "Nothing entered")}
      </p>
    </div>
  );
}

function TextareaPreview() {
  const text = usePreviewText();
  const [value, setValue] = useState<string | null>(null);
  return (
    <div className="catalog-preview-stack">
      <IqujiField
        label={text("组件说明", "Component description")}
        description={text(
          "适合录入多行文本。",
          "Enter multiple lines of text.",
        )}
      >
        <IqujiTextarea
          onChange={(event) => setValue(event.currentTarget.value)}
          rows={4}
          value={
            value ??
            text(
              "共享组件遵循统一的表单语义。",
              "Shared components use consistent form semantics.",
            )
          }
        />
      </IqujiField>
    </div>
  );
}

function MultiSelectPreview() {
  const text = usePreviewText();
  const [value, setValue] = useState<string[]>(["alpha"]);
  return (
    <div className="catalog-preview-stack">
      <IqujiMultiSelect
        clearLabel={text("清空", "Clear")}
        emptyLabel={text("没有匹配项", "No matching options")}
        label={text("插画主题", "Illustration themes")}
        onChange={setValue}
        options={[
          {
            value: "alpha",
            label: text("山峰", "Mountains"),
            description: text("山地景观", "Mountain landscapes"),
          },
          { value: "beta", label: text("湖泊", "Lakes") },
          { value: "gamma", label: text("森林", "Forests"), disabled: true },
        ]}
        placeholder={text("选择主题", "Select themes")}
        searchLabel={text("搜索选项", "Search options")}
        value={value}
      />
    </div>
  );
}

function SelectPreview() {
  const text = usePreviewText();
  const [value, setValue] = useState<string | null>("design");
  const roles = [
    { label: text("设计", "Design"), value: "design" },
    { label: text("开发", "Engineering"), value: "engineering" },
    { label: text("访客", "Guest"), value: "guest", disabled: true },
  ];
  return (
    <div className="catalog-preview-stack">
      <IqujiField label={text("默认角色", "Default role")}>
        <IqujiSelect onValueChange={setValue} options={roles} value={value} />
      </IqujiField>
      <p className="catalog-preview-copy">
        {text("所选值：", "Selected: ")}
        {roles.find((role) => role.value === value)?.label ??
          text("未选择", "None selected")}
      </p>
    </div>
  );
}

function CheckboxPreview() {
  const text = usePreviewText();
  const [checked, setChecked] = useState(true);
  return (
    <div className="catalog-preview-stack">
      <IqujiCheckbox
        checked={checked}
        description={text(
          "在页面底部显示插图说明。",
          "Show illustration captions at the bottom of the page.",
        )}
        label={text("显示插图说明", "Show captions")}
        onChange={(event) => setChecked(event.currentTarget.checked)}
      />
      <p className="catalog-preview-copy">
        {checked ? text("已启用", "Enabled") : text("已关闭", "Disabled")}
      </p>
    </div>
  );
}

function RadioPreview() {
  const text = usePreviewText();
  const [value, setValue] = useState("system");
  const labels = {
    system: text("跟随系统", "System theme"),
    light: text("浅色主题", "Light theme"),
  };
  return (
    <div className="catalog-preview-stack">
      <IqujiRadio
        checked={value === "system"}
        label={labels.system}
        name="preview-theme"
        onChange={() => setValue("system")}
        value="system"
      />
      <IqujiRadio
        checked={value === "light"}
        label={labels.light}
        name="preview-theme"
        onChange={() => setValue("light")}
        value="light"
      />
      <p className="catalog-preview-copy">
        {text("当前设置：", "Current setting: ")}
        {value === "system" ? labels.system : labels.light}
      </p>
    </div>
  );
}

function SwitchPreview() {
  const text = usePreviewText();
  const [enabled, setEnabled] = useState(true);
  return (
    <div className="catalog-preview-stack">
      <IqujiSwitch
        checked={enabled}
        description={text(
          "启用后会显示新版本提示。",
          "Get notified when a new version is available.",
        )}
        label={text("接收更新通知", "Receive update notifications")}
        onChange={(event) => setEnabled(event.currentTarget.checked)}
      />
    </div>
  );
}

function SegmentedPreview() {
  const text = usePreviewText();
  const [value, setValue] = useState("week");
  return (
    <IqujiSegmentedControl
      label={text("统计周期", "Reporting period")}
      onChange={setValue}
      options={[
        { label: text("周", "Week"), value: "week" },
        { label: text("月", "Month"), value: "month" },
        { label: text("年", "Year"), value: "year" },
      ]}
      value={value}
    />
  );
}

function CalendarPreview() {
  const text = usePreviewText();
  const { locale } = useIqujiLocale();
  const [value, setValue] = useState<string | null>("2030-01-15");
  const parsed = parseCalendarDate(value);
  return (
    <div className="catalog-preview-stack">
      <IqujiCalendar
        clearable
        footer={
          <span className="catalog-preview-copy">
            {text("选择日期查看状态", "Choose a date to see its value")}
          </span>
        }
        locale={locale}
        onChange={setValue}
        onClear={() => setValue(null)}
        showToday
        value={value}
      />
      <p className="catalog-preview-copy">
        {text("当前日期：", "Selected date: ")}
        {value ?? text("未选择", "None selected")}
        {text("，解析后格式化：", ". Parsed date: ")}
        {parsed
          ? formatCalendarDate(parsed)
          : text("无有效日期", "No valid date")}
      </p>
    </div>
  );
}

function EmojiPickerPreview() {
  const text = usePreviewText();
  const [value, setValue] = useState<string | null>("🤖");
  return (
    <IqujiEmojiPicker
      variant="secondary"
      value={value}
      onChange={setValue}
      label={text("头像表情", "Avatar emoji")}
      searchLabel={text("搜索", "Search")}
      emptyLabel={text("没有匹配项", "No matching options")}
      clearLabel={text("恢复默认", "Restore default")}
      allLabel={text("全部", "All")}
      options={[
        {
          value: "🤖",
          label: text("机器人", "Robot"),
          category: text("角色", "People and characters"),
          keywords: "robot AI",
        },
        {
          value: "🧑🏽‍💻",
          label: text("开发者 · 中等肤色", "Developer · Medium skin tone"),
          category: text("角色", "People and characters"),
          keywords: "developer",
        },
        {
          value: "🎨",
          label: text("设计", "Design"),
          category: text("工作", "Work"),
          keywords: "design",
        },
        {
          value: "👨‍👩‍👧‍👦",
          label: text("家庭", "Family"),
          category: text("角色", "People and characters"),
          keywords: "family",
        },
      ]}
    />
  );
}

function ColorPickerPreview() {
  const text = usePreviewText();
  const [value, setValue] = useState<string | null>("#1d4ed8");
  const normalized = normalizeIqujiColor(value ?? "");
  return (
    <div className="catalog-preview-stack">
      <IqujiColorPicker
        applyLabel={text("应用自定义颜色", "Apply custom color")}
        cancelLabel={text("取消", "Cancel")}
        customLabel={text("自定义颜色", "Custom color")}
        defaultLabel={text("恢复默认颜色", "Restore default color")}
        hexLabel={text("十六进制颜色", "Hex color")}
        label={text("强调色", "Accent color")}
        onChange={setValue}
        presets={[
          { value: "#1d4ed8", label: text("蓝色", "Blue") },
          { value: "#15803d", label: text("绿色", "Green") },
          { value: "#be185d", label: text("玫红色", "Magenta") },
        ]}
        value={value}
      />
      <p aria-live="polite" className="catalog-preview-copy">
        {text("当前颜色：", "Current color: ")}
        {value ?? text("使用默认值", "Default")}
        {text("，规范化结果：", ". Normalized color: ")}
        {normalized ?? text("无有效颜色", "No valid color")}
      </p>
    </div>
  );
}

function DatePickerPreview() {
  const text = usePreviewText();
  const { locale } = useIqujiLocale();
  const [value, setValue] = useState<string | null>("2030-01-15");
  return (
    <div className="catalog-preview-stack">
      <IqujiField label={text("发布日期", "Release date")}>
        <IqujiDatePicker
          locale={locale}
          onChange={setValue}
          placeholder={text("请选择日期", "Select a date")}
          value={value}
        />
      </IqujiField>
      <p className="catalog-preview-copy">
        {text(
          "选择日期后会关闭日历。",
          "The calendar closes after you select a date.",
        )}
      </p>
    </div>
  );
}

export const formPreviews: readonly ComponentPreview[] = [
  {
    id: "field",
    name: "IqujiField 字段",
    category: "表单",
    description: "组合可见标签、辅助说明与字段级校验反馈。",
    keywords: "IqujiField 标签 必填 错误 校验",
    render: () => <FieldPreview />,
  },
  {
    id: "input",
    name: "IqujiInput 输入框",
    category: "表单",
    description: "单行文本输入，支持原生输入属性与受控值。",
    keywords: "IqujiInput 文本 email 搜索",
    render: () => <InputPreview />,
  },
  {
    id: "textarea",
    name: "IqujiTextarea 多行输入",
    category: "表单",
    description: "用于说明、备注和其他多行文本。",
    keywords: "IqujiTextarea 长文本",
    render: () => <TextareaPreview />,
  },
  {
    id: "select",
    name: "IqujiSelect 选择器",
    category: "表单",
    description: "使用可访问菜单选择单项，选项由调用方提供。",
    keywords: "IqujiSelect 下拉 选项 禁用",
    render: () => <SelectPreview />,
  },
  {
    id: "multi-select",
    name: "IqujiMultiSelect 多选",
    category: "表单",
    description: "在浮层中勾选多个选项，支持清空与禁用项。",
    keywords: "IqujiMultiSelect 多选 复选",
    render: () => <MultiSelectPreview />,
  },
  {
    id: "checkbox",
    name: "IqujiCheckbox 多选框",
    category: "表单",
    description: "独立的二元选择，支持名称和持续可见说明。",
    keywords: "IqujiCheckbox 勾选 多选",
    render: () => <CheckboxPreview />,
  },
  {
    id: "radio",
    name: "IqujiRadio 单选框",
    category: "表单",
    description: "在一组互斥选项中选择一项。",
    keywords: "IqujiRadio 单选 选项组",
    render: () => <RadioPreview />,
  },
  {
    id: "switch",
    name: "IqujiSwitch 开关",
    category: "表单",
    description: "立即生效的开关状态，整行提供可点击区域。",
    keywords: "IqujiSwitch 切换 设置",
    render: () => <SwitchPreview />,
  },
  {
    id: "segmented-control",
    name: "IqujiSegmentedControl 分段选择",
    category: "表单",
    description: "在少量同级视图或选项间快速切换。",
    keywords: "IqujiSegmentedControl 分段",
    render: () => <SegmentedPreview />,
  },
  {
    id: "calendar",
    name: "IqujiCalendar 日历",
    category: "表单",
    description: "内联日期日历，支持键盘导航、清除和今日操作。",
    keywords: "IqujiCalendar 日期 月份 年份",
    render: () => <CalendarPreview />,
  },
  {
    id: "date-picker",
    name: "IqujiDatePicker 日期选择",
    category: "表单",
    description: "将日期日历放入浮层，并在选中后返回日期值。",
    keywords: "IqujiDatePicker 日期 弹层",
    render: () => <DatePickerPreview />,
  },
  {
    id: "emoji-picker",
    name: "IqujiEmojiPicker Emoji 选择",
    category: "表单",
    description: "支持搜索、受控选择与恢复默认的 Emoji 选择器。",
    keywords: "IqujiEmojiPicker emoji avatar",
    render: () => <EmojiPickerPreview />,
  },
  {
    id: "color-picker",
    name: "IqujiColorPicker 颜色选择",
    category: "表单",
    description: "通过调色板或自定义十六进制值更新本地颜色状态。",
    keywords: "IqujiColorPicker color hex swatch preset",
    render: () => <ColorPickerPreview />,
  },
];
