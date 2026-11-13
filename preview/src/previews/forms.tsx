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
} from "@iquji-web/web-component";
import { useState } from "react";
import type { ComponentPreview } from "../catalog";

function FieldPreview() {
  return (
    <div className="catalog-preview-stack">
      <IqujiField description="用于通知与登录验证。" label="联系邮箱" required>
        <IqujiInput defaultValue="hello@example.com" type="email" />
      </IqujiField>
      <IqujiField error="请输入有效的邮箱地址。" label="备用邮箱">
        <IqujiInput defaultValue="not-an-email" type="email" />
      </IqujiField>
      <IqujiField description="只读字段仍允许选中和复制。" label="服务器标识">
        <IqujiInput defaultValue="server-production-01" readOnly />
      </IqujiField>
      <IqujiField label="暂不可编辑">
        <IqujiInput defaultValue="等待连接就绪" disabled />
      </IqujiField>
    </div>
  );
}

function InputPreview() {
  const [value, setValue] = useState("");
  return (
    <div className="catalog-preview-stack">
      <IqujiField description="输入内容会即时显示。" label="项目名称">
        <IqujiInput
          onChange={(event) => setValue(event.currentTarget.value)}
          placeholder="例如：拾光盒子"
          value={value}
        />
      </IqujiField>
      <p className="catalog-preview-copy" aria-live="polite">
        当前值：{value || "尚未输入"}
      </p>
    </div>
  );
}

function TextareaPreview() {
  const [value, setValue] = useState("共享组件遵循统一的表单语义。");
  return (
    <div className="catalog-preview-stack">
      <IqujiField label="组件说明" description="适合录入多行文本。">
        <IqujiTextarea
          onChange={(event) => setValue(event.currentTarget.value)}
          rows={4}
          value={value}
        />
      </IqujiField>
    </div>
  );
}

function MultiSelectPreview() {
  const [value, setValue] = useState<string[]>(["alpha"]);
  return (
    <div className="catalog-preview-stack">
      <IqujiMultiSelect
        clearLabel="清空"
        label="负责服务器"
        onChange={setValue}
        options={[
          { value: "alpha", label: "alpha", description: "主要部署节点" },
          { value: "beta", label: "beta" },
          { value: "gamma", label: "gamma", disabled: true },
        ]}
        placeholder="选择服务器"
        value={value}
      />
    </div>
  );
}

function SelectPreview() {
  const [value, setValue] = useState<string | null>("design");
  return (
    <div className="catalog-preview-stack">
      <IqujiField label="默认角色">
        <IqujiSelect
          onValueChange={setValue}
          options={[
            { label: "设计", value: "design" },
            { label: "开发", value: "engineering" },
            { label: "访客", value: "guest", disabled: true },
          ]}
          value={value}
        />
      </IqujiField>
      <p className="catalog-preview-copy">所选值：{value ?? "未选择"}</p>
    </div>
  );
}

function CheckboxPreview() {
  const [checked, setChecked] = useState(true);
  return (
    <div className="catalog-preview-stack">
      <IqujiCheckbox
        checked={checked}
        description="允许项目成员查看组件规范。"
        label="共享组件文档"
        onChange={(event) => setChecked(event.currentTarget.checked)}
      />
      <p className="catalog-preview-copy">{checked ? "已启用" : "已关闭"}</p>
    </div>
  );
}

function RadioPreview() {
  const [value, setValue] = useState("system");
  return (
    <div className="catalog-preview-stack">
      <IqujiRadio
        checked={value === "system"}
        label="跟随系统"
        name="preview-theme"
        onChange={() => setValue("system")}
        value="system"
      />
      <IqujiRadio
        checked={value === "light"}
        label="浅色主题"
        name="preview-theme"
        onChange={() => setValue("light")}
        value="light"
      />
      <p className="catalog-preview-copy">当前设置：{value}</p>
    </div>
  );
}

function SwitchPreview() {
  const [enabled, setEnabled] = useState(true);
  return (
    <div className="catalog-preview-stack">
      <IqujiSwitch
        checked={enabled}
        description="启用后会显示新版本提示。"
        label="接收更新通知"
        onChange={(event) => setEnabled(event.currentTarget.checked)}
      />
    </div>
  );
}

function SegmentedPreview() {
  const [value, setValue] = useState("week");
  return (
    <IqujiSegmentedControl
      label="统计周期"
      onChange={setValue}
      options={[
        { label: "周", value: "week" },
        { label: "月", value: "month" },
        { label: "年", value: "year" },
      ]}
      value={value}
    />
  );
}

function CalendarPreview() {
  const [value, setValue] = useState<string | null>("2026-10-22");
  const parsed = parseCalendarDate(value);
  return (
    <div className="catalog-preview-stack">
      <IqujiCalendar
        clearable
        footer={<span className="catalog-preview-copy">选择日期查看状态</span>}
        onChange={setValue}
        onClear={() => setValue(null)}
        showToday
        value={value}
      />
      <p className="catalog-preview-copy">
        当前日期：{value ?? "未选择"}；解析后格式化：
        {parsed ? formatCalendarDate(parsed) : "无有效日期"}
      </p>
    </div>
  );
}

function EmojiPickerPreview() {
  const [value, setValue] = useState<string | null>("🤖");
  return (
    <IqujiEmojiPicker
      variant="secondary"
      value={value}
      onChange={setValue}
      label="头像 Emoji"
      searchLabel="搜索"
      emptyLabel="没有匹配项"
      clearLabel="恢复默认"
      allLabel="全部"
      options={[
        {
          value: "🤖",
          label: "机器人",
          category: "角色",
          keywords: "robot AI",
        },
        {
          value: "🧑🏽‍💻",
          label: "开发者 · 中等肤色",
          category: "角色",
          keywords: "developer",
        },
        { value: "🎨", label: "设计", category: "工作", keywords: "design" },
        {
          value: "👨‍👩‍👧‍👦",
          label: "家庭",
          category: "角色",
          keywords: "family",
        },
      ]}
    />
  );
}

function ColorPickerPreview() {
  const [value, setValue] = useState<string | null>("#1d4ed8");
  const normalized = normalizeIqujiColor(value ?? "");
  return (
    <div className="catalog-preview-stack">
      <IqujiColorPicker
        applyLabel="应用自定义颜色"
        cancelLabel="取消"
        customLabel="自定义颜色"
        defaultLabel="恢复默认颜色"
        hexLabel="十六进制颜色"
        label="强调色"
        onChange={setValue}
        presets={[
          { value: "#1d4ed8", label: "蓝色" },
          { value: "#15803d", label: "绿色" },
          { value: "#be185d", label: "玫红色" },
        ]}
        value={value}
      />
      <p aria-live="polite" className="catalog-preview-copy">
        当前颜色：{value ?? "使用默认值"}；规范化结果：
        {normalized ?? "无有效颜色"}。
      </p>
    </div>
  );
}

function DatePickerPreview() {
  const [value, setValue] = useState<string | null>("2026-10-22");
  return (
    <div className="catalog-preview-stack">
      <IqujiField label="发布日期">
        <IqujiDatePicker onChange={setValue} value={value} />
      </IqujiField>
      <p className="catalog-preview-copy">选择日期后会关闭日历。</p>
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
