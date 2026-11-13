# @iquji-web/web-component

[简体中文](README.md) | English

Core Web component library for Iquji Web. Built on top of Base UI and WAI-ARIA standards, providing accessible form inputs, data display, navigation, feedback notifications, modal dialogs, three-pane workbenches, and desktop shells.

---

## Installation

```bash
npm install @iquji-web/web-component @iquji-web/web-theme @iquji-web/web-icons
```

> **Note**: Consuming applications must provide `react`, `react-dom` (>= 19) and Base UI dependencies. Styles must be imported in the exact order:
> ```tsx
> import "@iquji-web/web-theme/tokens.css";
> import "@iquji-web/web-component/styles.css";
> ```

---

## Component Overview

### 1. General & Actions
- **`IqujiButton` / `IconButton` / `IqujiButtonLink`**: Semantics for `primary`, `secondary`, `ghost`, and `danger`. Native `disabled` and `loading` states prevent focus traps and double-submits.
- **`StatusBadge` / `IqujiBadge`**: Status indicators and count tags.
- **`IqujiEmptyState` / `IqujiLoadingState`**: Structured empty and loading placeholders.

### 2. Form Controls
- **`IqujiField`**: Layout wrapper associating `label`, required markers, helper descriptions, validation errors, and `aria-describedby`.
- **Inputs & Selects**: `IqujiInput`, `IqujiTextarea`, `IqujiSelect`, `IqujiMultiSelect`, `IqujiCheckbox`, `IqujiRadio`, `IqujiSwitch`, `IqujiSegmentedControl`.
- **Date & Pickers**: `IqujiCalendar`, `IqujiDatePicker`, `IqujiColorPicker`, `IqujiEmojiPicker`.

### 3. Navigation
- **`IqujiTabs`**: Underline or segmented tab controls with keyboard arrow navigation.
- **`IqujiPagination`**: Controlled pagination contract.
- **`IqujiFormSteps`**: Clean numbered step navigation.
- **`IqujiSettingsNav`**: Settings category sidebar navigation.

### 4. Overlays & Modals
- **`IqujiOverlayProvider`**: Application-level overlay container managing stacking contexts and focus traps.
- **`IqujiDialog` / `IqujiDrawer`**: Controlled dialogs and slide-out drawers with smooth exit transitions and focus restoration.
- **`IqujiConfirmDialog`**: Confirmation dialogs defaulting focus to Cancel to prevent accidental destructive actions.
- **`IqujiFormDialog`**: Centered dialogs with expandable layout for complex form entry.
- **`IqujiSearchDialog`**: Global command search dialog with grouped filtering and keyboard selection.
- **`IqujiTooltip` / `IqujiPopover` / `IqujiDropdownMenu`**: Positioned floating panels.

### 5. Feedback & Notifications
- **`IqujiNotificationProvider` & `useIqujiNotification`**: Floating toast notifications with auto-dismiss, same-key updates, progress timers, and hover-to-pause.
- **`IqujiAlert`**: Inlined contextual messages for warnings and notifications.
- **`IqujiProgressBar` / `IqujiSkeleton` / `IqujiTimeline`**: Progress bars, skeleton loaders, and vertical event timelines.

### 6. Layout & Desktop
- **`AppShell`**: Classic responsive application layout with grouped sidebar navigation.
- **`IqujiWorkbenchLayout`**: Three-pane responsive workbench with collapsible panels and splitters.
- **`IqujiDesktopShell`**: Desktop window chrome for Electron/Tauri (title bars, tab strips, rail, and account menus).
- **`IqujiDataTable` / `IqujiTableFrame`**: Data table and scrollable table frames.

---

## Example Usage

```tsx
import { useState } from "react";
import {
  IqujiOverlayProvider,
  IqujiButton,
  IqujiDialog,
  IqujiField,
  IqujiInput
} from "@iquji-web/web-component";

export function Example() {
  const [open, setOpen] = useState(false);

  return (
    <IqujiOverlayProvider>
      <IqujiButton onClick={() => setOpen(true)}>Open Dialog</IqujiButton>

      <IqujiDialog
        open={open}
        onOpenChange={setOpen}
        title="Edit Configuration"
        description="Update your project settings and save."
        closeLabel="Close"
        actions={
          <>
            <IqujiButton onClick={() => setOpen(false)}>Save</IqujiButton>
            <IqujiButton variant="secondary" onClick={() => setOpen(false)}>Cancel</IqujiButton>
          </>
        }
      >
        <IqujiField label="Project Name" required>
          <IqujiInput placeholder="Enter project name" />
        </IqujiField>
      </IqujiDialog>
    </IqujiOverlayProvider>
  );
}
```

---

## Development & Build

```bash
bun install --frozen-lockfile
bun run build       # Compile to dist/
bun run typecheck   # Type verification
bun run test        # Unit & accessibility tests
bun run check       # Complete verification suite
```
