import { describe, expect, test } from "bun:test";
import { IqujiIcon } from "@iquji-web/web-icons";
import { renderToStaticMarkup } from "react-dom/server";
import {
  AppShell,
  IconButton,
  IqujiAlert,
  IqujiAsyncStateFrame,
  IqujiButton,
  IqujiButtonLink,
  IqujiCalendar,
  IqujiCheckbox,
  IqujiDatePicker,
  IqujiField,
  IqujiInput,
  IqujiSelect,
  IqujiSkeleton,
  IqujiTableFrame,
} from "./index.js";

describe("通用控件正式行为", () => {
  test("AppShell supports semantic navigation groups while retaining item state", () => {
    const markup = renderToStaticMarkup(
      <AppShell
        brand="Cloud"
        header="Header"
        navigation={[]}
        navigationGroups={[
          {
            id: "projects",
            label: "项目管理",
            items: [{ id: "directory", label: "项目目录", href: "/projects", active: true }],
          },
        ]}
        navigationLabel="Cloud 导航"
      >
        <div>Content</div>
      </AppShell>,
    );

    expect(markup).toContain('<section aria-labelledby="projects-navigation-heading"');
    expect(markup).toContain("项目管理");
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain('href="/projects"');
  });

  test("renders named controls, state roles, and scrollable table regions", () => {
    const markup = renderToStaticMarkup(
      <>
        <IqujiField
          description="Public description"
          label="Project name"
          required
        >
          <IqujiInput name="name" />
        </IqujiField>
        <IqujiCheckbox label="Enabled" />
        <IqujiAlert tone="danger">Unavailable</IqujiAlert>
        <IqujiTableFrame label="Projects">
          <table>
            <tbody>
              <tr>
                <td>Project</td>
              </tr>
            </tbody>
          </table>
        </IqujiTableFrame>
        <IqujiIcon decorative={false} label="Information" name="circle-info" />
      </>,
    );

    expect(markup).toContain("Project name");
    expect(markup).toContain("required");
    expect(markup).toContain('role="alert"');
    expect(markup).toContain('aria-label="Projects"');
    expect(markup).toContain('aria-label="Information"');
  });

  test("renders the canonical Select contract without native option children", () => {
    const markup = renderToStaticMarkup(
      <>
        <IqujiField label="Theme">
          <IqujiSelect<"light" | "dark">
            compact
            iconStart={<IqujiIcon decorative name="sun" />}
            id="theme-control"
            invalid
            options={[
              { label: "Light", value: "light" },
              { label: "Dark", value: "dark" },
            ]}
            required
            value="dark"
          />
        </IqujiField>
        <IqujiSelect
          aria-label="Region"
          disabled
          options={[{ label: "Shanghai", value: "shanghai" }]}
          placeholder="Choose region"
          value={null}
        />
        <IqujiSelect
          aria-label="Appearance"
          iconStart={<IqujiIcon decorative name="sun" />}
          options={[{ label: "System", value: "system" }]}
          triggerPresentation="icon-only"
          value="system"
        />
      </>,
    );

    expect(markup).toContain('role="combobox"');
    expect(markup).toContain('for="theme-control"');
    expect(markup).toContain('id="theme-control"');
    expect(markup).toContain('aria-invalid="true"');
    expect(markup).toContain('aria-required="true"');
    expect(markup).toContain("iquji-select--compact");
    expect(markup).toContain("Dark");
    expect(markup).toContain('aria-label="Region"');
    expect(markup).toContain("Choose region");
    expect(markup).toContain("iquji-select--icon-only");
    expect(markup).toContain('data-trigger-presentation="icon-only"');
    expect(markup).toContain('aria-label="Appearance"');
    expect(markup).toContain("disabled");
    expect(markup).not.toContain("<select");
    expect(markup).not.toContain("<option");
  });

  test("renders canonical DatePicker and Calendar contracts without native date input", () => {
    const markup = renderToStaticMarkup(
      <>
        <IqujiDatePicker
          id="due-date-control"
          placeholder="Select due date"
          value="2026-09-18"
        />
        <IqujiCalendar defaultValue="2026-09-18" value="2026-09-18" />
      </>,
    );

    expect(markup).toContain('id="due-date-control"');
    expect(markup).toContain("2026-09-18");
    expect(markup).toContain('aria-haspopup="dialog"');
    expect(markup).toContain("iquji-date-picker");
    expect(markup).toContain("iquji-calendar");
    const rendered = new DOMParser().parseFromString(markup, "text/html");
    const calendar = rendered.querySelector('table[aria-label="日期"]');
    expect(calendar?.querySelector('thead th[scope="col"]')).not.toBeNull();
    expect(
      calendar
        ?.querySelector('tbody td button[aria-pressed="true"]')
        ?.getAttribute("aria-label"),
    ).toBe("2026-09-18");
    expect(markup).toContain("iquji-calendar__cell--selected");
    expect(markup).not.toContain('type="date"');
  });

  test("keeps shared controls and loading frames semantically stable", () => {
    const markup = renderToStaticMarkup(
      <>
        <IqujiButton loading variant="secondary">
          Save
        </IqujiButton>
        <IqujiButton variant="ghost">
          <div data-structured-button-content>Structured content</div>
        </IqujiButton>
        <IqujiButtonLink
          allowLabelWrap
          href="/next"
          iconEnd={<span>→</span>}
          loading
        >
          Continue
        </IqujiButtonLink>
        <IconButton
          icon={<span>+</span>}
          label="Add Project"
          variant="primary"
        />
        <IqujiAsyncStateFrame
          aria-label="Loading projects"
          loadingFallback={<IqujiSkeleton height={12} width="70%" />}
          role="status"
          state="loading"
        >
          <span>Private content</span>
        </IqujiAsyncStateFrame>
      </>,
    );

    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain("disabled");
    expect(markup).toContain('aria-label="Add Project"');
    expect(markup).toContain('aria-disabled="true"');
    expect(markup).toContain("iquji-button-link--allow-label-wrap");
    expect(markup).toContain('aria-label="Loading projects"');
    expect(markup).toContain('data-state="loading"');
    expect(markup).toContain(
      'type="button"><div data-structured-button-content="true"',
    );
    expect(markup).not.toContain(
      'iquji-button__label"><div data-structured-button-content',
    );
    expect(markup).not.toContain("Private content");
  });
});
