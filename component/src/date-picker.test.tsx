import { afterEach, expect, test } from "bun:test";
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { IqujiDatePicker } from "./date-picker.js";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const roots: Root[] = [];

afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.replaceChildren();
});

function ControlledDatePicker({
  onChange,
}: {
  onChange: (value: string | null) => void;
}) {
  const [value, setValue] = useState<string | null>("2026-10-22");
  return (
    <IqujiDatePicker
      aria-label="发布日期"
      onChange={(nextValue) => {
        setValue(nextValue);
        onChange(nextValue);
      }}
      value={value}
    />
  );
}

test("清除按钮独立于 DatePicker 触发器并清空受控日期", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  roots.push(root);
  const values: Array<string | null> = [];

  await act(async () => {
    root.render(<ControlledDatePicker onChange={(value) => values.push(value)} />);
  });

  const trigger = host.querySelector<HTMLButtonElement>(
    'button[aria-haspopup="dialog"]',
  );
  const clearButton = host.querySelector<HTMLButtonElement>(
    'button[aria-label="清除日期"]',
  );
  expect(trigger).not.toBeNull();
  expect(clearButton).not.toBeNull();
  expect(clearButton?.tabIndex).toBe(0);
  expect(trigger?.contains(clearButton)).toBe(false);
  expect(host.querySelector("button button")).toBeNull();

  await act(async () => clearButton?.click());

  expect(values).toEqual([null]);
  expect(trigger?.textContent).toContain("请选择日期");
  expect(host.querySelector('button[aria-label="清除日期"]')).toBeNull();
});
