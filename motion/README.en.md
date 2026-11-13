# @iquji-web/web-motion

[简体中文](README.md) | English

Shared motion primitives for Iquji Web. Wraps Framer Motion with standard durations, easing curves, and variant presets for controls, overlays, and route transitions with automatic `prefers-reduced-motion` compliance.

---

## Installation

```bash
npm install @iquji-web/web-motion framer-motion
```

---

## Usage

### 1. Motion Provider

Wrap your app with `IqujiMotionProvider`:

```tsx
import { IqujiMotionProvider } from "@iquji-web/web-motion";

export function App({ children }) {
  return (
    <IqujiMotionProvider reducedMotion="user">
      {children}
    </IqujiMotionProvider>
  );
}
```

### 2. Route & Element Transitions

```tsx
import { IqujiMotion, iqujiMotionPresets, iqujiMotionVariants } from "@iquji-web/web-motion";

export function PageTransition({ children }) {
  return (
    <IqujiMotion.div
      initial={iqujiMotionVariants.route.initial}
      animate={iqujiMotionVariants.route.enter}
      transition={iqujiMotionPresets.route}
    >
      {children}
    </IqujiMotion.div>
  );
}
```

---

## Standard Timing Presets

- **Control (`control`)**: `0.14s` for buttons and micro-interactions.
- **Overlay (`overlay`)**: `0.19s` for modals, dialogs, and slide-in drawers.
- **Route (`route`)**: `0.24s` for page navigation.

---

## Development & Build

```bash
bun install --frozen-lockfile
bun run build       # Compile dist/
bun run typecheck   # Typecheck
bun run test        # Unit tests
bun run check       # Complete test suite
```
