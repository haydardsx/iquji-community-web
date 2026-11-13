import { afterEach, describe, expect, test } from "bun:test";
import { IqujiIcon } from "@iquji-web/web-icons";
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { IqujiSelect } from "./forms.js";
import { IqujiOverlayScopeProvider } from "./overlay-scope.js";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const mountedRoots: Root[] = [];

afterEach(async () => {
  await act(async () => {
    for (const root of mountedRoots.splice(0)) root.unmount();
  });
  document.body.replaceChildren();
});

const waitForDom = async () => {
  await Promise.resolve();
  await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
};

async function pressKey(target: Element, key: string) {
  await act(async () => {
    target.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key }),
    );
    await waitForDom();
  });
}

function SelectFixture({
  onValueChange,
}: {
  onValueChange: (value: string | null) => void;
}) {
  const [value, setValue] = useState<string | null>("alpha");
  return (
    <IqujiSelect
      aria-label="Environment"
      onValueChange={(nextValue) => {
        setValue(nextValue);
        onValueChange(nextValue);
      }}
      options={[
        { label: "Alpha", value: "alpha" },
        { label: "Beta", value: "beta" },
        { label: "Gamma", value: "gamma" },
      ]}
      value={value}
    />
  );
}

describe("IqujiSelect browser behavior", () => {
  test("分组标题具有可访问名称且键盘跨组不会提交禁用选项", async () => {
    const appRoot = document.createElement("div");
    document.body.append(appRoot);
    const values: Array<string | null> = [];
    const root = createRoot(appRoot);
    mountedRoots.push(root);
    await act(async () => {
      root.render(
        <IqujiSelect
          aria-label="Grouped environment"
          defaultValue="alpha"
          groups={[
            {
              key: "first",
              label: "First group",
              options: [
                { value: "alpha", label: "Alpha" },
                { value: "beta", label: "Beta", disabled: true },
              ],
            },
            {
              key: "second",
              label: "Second group",
              options: [{ value: "gamma", label: "Gamma" }],
            },
          ]}
          onValueChange={(value) => values.push(value)}
          options={[]}
        />,
      );
      await waitForDom();
    });
    const trigger =
      appRoot.querySelector<HTMLButtonElement>('[role="combobox"]');
    expect(trigger?.textContent).toContain("Alpha");
    trigger?.focus();
    await pressKey(trigger as HTMLButtonElement, "ArrowDown");
    const firstGroup = document.body.querySelector('[role="group"]');
    const labelId = firstGroup?.getAttribute("aria-labelledby");
    expect(labelId ? document.getElementById(labelId)?.textContent : null).toBe(
      "First group",
    );
    await pressKey(document.activeElement as Element, "ArrowDown");
    await pressKey(document.activeElement as Element, "Enter");
    expect(values).toEqual([]);
    expect(trigger?.getAttribute("aria-expanded")).toBe("true");
    await pressKey(document.activeElement as Element, "ArrowDown");
    const highlighted = document.body.querySelector(
      '[role="option"][data-highlighted]',
    );
    expect(highlighted?.textContent).toContain("Gamma");
    await pressKey(document.activeElement as Element, "Enter");
    expect(values).toEqual(["gamma"]);
    expect(trigger?.textContent).toContain("Gamma");
    expect(document.activeElement).toBe(trigger);
  });

  test("keeps an icon-only trigger named while preserving full popup labels", async () => {
    const appRoot = document.createElement("div");
    const overlayRoot = document.createElement("div");
    document.body.append(appRoot, overlayRoot);
    const root = createRoot(appRoot);
    mountedRoots.push(root);

    await act(async () => {
      root.render(
        <IqujiOverlayScopeProvider container={overlayRoot}>
          <IqujiSelect
            aria-label="Appearance"
            iconStart={<IqujiIcon decorative name="sun" />}
            options={[
              { label: "Light", value: "light" },
              { label: "Dark", value: "dark" },
            ]}
            triggerPresentation="icon-only"
            value="light"
          />
        </IqujiOverlayScopeProvider>,
      );
      await waitForDom();
    });

    const trigger =
      appRoot.querySelector<HTMLButtonElement>('[role="combobox"]');
    expect(trigger?.getAttribute("aria-label")).toBe("Appearance");
    expect(trigger?.getAttribute("title")).toBe("Appearance");
    expect(trigger?.getAttribute("data-trigger-presentation")).toBe(
      "icon-only",
    );
    expect(trigger?.classList.contains("iquji-select--icon-only")).toBe(true);
    expect(trigger?.querySelector(".iquji-select__value")).not.toBeNull();

    trigger?.focus();
    await pressKey(trigger as HTMLButtonElement, "ArrowDown");
    expect(overlayRoot.querySelector('[role="option"]')?.textContent).toContain(
      "Light",
    );
  });

  test("portals into the active overlay scope and selects with typeahead", async () => {
    const appRoot = document.createElement("div");
    const overlayRoot = document.createElement("div");
    document.body.append(appRoot, overlayRoot);
    const values: Array<string | null> = [];
    const root = createRoot(appRoot);
    mountedRoots.push(root);

    await act(async () => {
      root.render(
        <IqujiOverlayScopeProvider container={overlayRoot}>
          <SelectFixture onValueChange={(value) => values.push(value)} />
        </IqujiOverlayScopeProvider>,
      );
      await waitForDom();
    });

    const trigger =
      appRoot.querySelector<HTMLButtonElement>('[role="combobox"]');
    expect(trigger).not.toBeNull();
    trigger?.focus();
    await pressKey(trigger as HTMLButtonElement, "ArrowDown");

    const listbox = overlayRoot.querySelector('[role="listbox"]');
    expect(listbox).not.toBeNull();
    expect(document.body.querySelector('[role="listbox"]')).toBe(listbox);

    await pressKey(
      document.activeElement ?? (trigger as HTMLButtonElement),
      "b",
    );
    const highlighted = overlayRoot.querySelector(
      '[role="option"][data-highlighted]',
    );
    expect(highlighted?.textContent).toContain("Beta");
    await pressKey(document.activeElement ?? (highlighted as Element), "Enter");

    expect(values).toEqual(["beta"]);
    expect(trigger?.textContent).toContain("Beta");
    expect(
      overlayRoot
        .querySelector('[role="listbox"]')
        ?.closest(".iquji-select__popup")
        ?.hasAttribute("data-closed"),
    ).toBe(true);
    expect(trigger?.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });

  test("restores trigger focus when Escape closes the popup", async () => {
    const appRoot = document.createElement("div");
    document.body.append(appRoot);
    const root = createRoot(appRoot);
    mountedRoots.push(root);

    await act(async () => {
      root.render(<SelectFixture onValueChange={() => undefined} />);
      await waitForDom();
    });

    const trigger =
      appRoot.querySelector<HTMLButtonElement>('[role="combobox"]');
    trigger?.focus();
    await pressKey(trigger as HTMLButtonElement, "ArrowDown");
    expect(document.body.querySelector('[role="listbox"]')).not.toBeNull();
    await pressKey(
      document.activeElement ?? (trigger as HTMLButtonElement),
      "Escape",
    );

    expect(
      document.body
        .querySelector('[role="listbox"]')
        ?.closest(".iquji-select__popup")
        ?.hasAttribute("data-closed"),
    ).toBe(true);
    expect(trigger?.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });
});
