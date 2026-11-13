import { afterEach, describe, expect, test } from "bun:test";
import { IqujiIcon } from "@iquji-cloud/web-icons";
import { act, type ReactNode, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { IqujiButton } from "./index.js";
import {
  IqujiSettingsContent,
  IqujiSettingsLayout,
  IqujiSettingsSection,
} from "./settings-layout.js";
import { IqujiSettingsNav } from "./settings-nav.js";
import {
  IqujiSettingsActionRow,
  IqujiSettingsSelectRow,
  IqujiSettingsSwitchRow,
} from "./settings-rows.js";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const roots: Root[] = [];
const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 30));

afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.replaceChildren();
});

async function mount(content: ReactNode) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  roots.push(root);
  await act(async () => {
    root.render(content);
    await tick();
  });
}

function required<T>(value: T | null | undefined): T {
  if (value == null) throw new Error("测试中缺少目标元素");
  return value;
}

function SettingsFixture({
  onSearch,
}: {
  onSearch?: (value: string) => void;
}) {
  const [search, setSearch] = useState("");
  return (
    <IqujiSettingsLayout
      navigation={
        <IqujiSettingsNav
          groups={[
            {
              items: [
                {
                  active: true,
                  icon: <IqujiIcon decorative name="settings" />,
                  key: "general",
                  label: "General",
                  onSelect: () => undefined,
                },
                {
                  icon: <IqujiIcon decorative name="sun" />,
                  key: "appearance",
                  label: "Appearance",
                  onSelect: () => undefined,
                },
              ],
              key: "personal",
              label: "Personal",
            },
          ]}
          label="Settings"
          search={{
            label: "Search settings",
            onChange: (value) => {
              setSearch(value);
              onSearch?.(value);
            },
            placeholder: "Search",
            value: search,
          }}
        />
      }
    >
      <IqujiSettingsContent title="General">
        <IqujiSettingsSection title="Permissions">
          <IqujiSettingsSwitchRow
            defaultChecked
            description="Choose what the workspace tool can read and edit."
            label="Default permission"
          />
          <IqujiSettingsSelectRow
            description="Interface language."
            label="Language"
            options={[
              { label: "Auto detect", value: "system" },
              { label: "English", value: "en-US" },
            ]}
            value="system"
          />
          <IqujiSettingsActionRow
            action={<IqujiButton>Change</IqujiButton>}
            description="Storage location for conversations outside projects."
            label="Workspace folder"
            value="/tmp/workspace"
          />
        </IqujiSettingsSection>
      </IqujiSettingsContent>
    </IqujiSettingsLayout>
  );
}

describe("设置页正式行为", () => {
  test("渲染导航、搜索、分区和标准设置行", () => {
    const markup = renderToStaticMarkup(<SettingsFixture />);

    expect(markup).toContain('aria-label="Settings"');
    expect(markup).toContain("Search settings");
    expect(markup).toContain('type="search"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain("<h1");
    expect(markup).toContain("General");
    expect(markup).toContain("<h2");
    expect(markup).toContain("Permissions");
    expect(markup).toContain('role="switch"');
    expect(markup).toContain("Default permission");
    expect(markup).toContain("Choose what the workspace tool can read and edit.");
    expect(markup).toContain("Change");
    expect(markup).toContain("/tmp/workspace");
  });

  test("选择行把行标题和说明关联到选择触发器", async () => {
    await mount(<SettingsFixture />);
    const combobox = required(
      document.querySelector<HTMLElement>('[role="combobox"]'),
    );
    const labelledBy = combobox.getAttribute("aria-labelledby");
    const describedBy = combobox.getAttribute("aria-describedby");
    expect(labelledBy).toBeTruthy();
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(labelledBy ?? "")?.textContent).toBe(
      "Language",
    );
    expect(document.getElementById(describedBy ?? "")?.textContent).toBe(
      "Interface language.",
    );
  });

  test("搜索框有正式标签并上报受控值", async () => {
    const values: string[] = [];
    await mount(<SettingsFixture onSearch={(value) => values.push(value)} />);
    const input = required(
      document.querySelector<HTMLInputElement>('input[type="search"]'),
    );
    const label = required(document.querySelector<HTMLLabelElement>("label[for]"));
    expect(label.getAttribute("for")).toBe(input.id);

    await act(async () => {
      const setValue = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set;
      setValue?.call(input, "gen");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await tick();
    });
    expect(values).toContain("gen");
  });
});
