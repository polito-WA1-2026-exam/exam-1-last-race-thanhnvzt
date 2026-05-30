# UX Direction

## Chosen UI Concept

Use a **desktop transit-control game cockpit**. The application should look like
a compact planning tool for a metro challenge, not like a marketing landing page
or a generic game arcade.

This is appropriate because Last Race is about:

- studying a fixed metro network;
- reconstructing routes under time pressure;
- selecting ordered segments;
- watching score changes from route events;
- comparing best results in a ranking.

## Visual Language

### Layout

- Use a fixed-height application shell with a top navigation bar.
- Keep page content inside one main work area.
- Use two- or three-column desktop layouts for game screens.
- Avoid hero sections except for the public instruction page, and even there
  keep it instructional rather than promotional.
- Avoid nested cards. Use panels for major work areas and cards only for
  repeated items such as ranking rows or route steps.

### Palette

Recommended CSS tokens:

```css
:root {
  --color-bg: #f7f8fa;
  --color-surface: #ffffff;
  --color-surface-muted: #eef1f4;
  --color-text: #17202a;
  --color-muted: #5b6775;
  --color-border: #d8dee6;
  --color-primary: #1f6f8b;
  --color-primary-strong: #14566d;
  --color-accent: #d97706;
  --color-success: #15803d;
  --color-danger: #b42318;
  --color-warning: #b45309;
  --color-focus: #2563eb;
}
```

Metro line colors should remain distinct and not depend only on color:

```css
--line-red: #d64545;
--line-blue: #2f6fde;
--line-green: #2f8f5b;
--line-gold: #c9971a;
--line-violet: #7c4dff;
```

Use station labels, line names, route order numbers, and legends so color is not
the only indicator.

### Typography

Use a system font stack for reliability and no extra dependency:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
  "Segoe UI", sans-serif;
```

If the student later chooses to add a web font, Atkinson Hyperlegible is a good
accessible body font, but it should be documented and loaded with
`font-display: swap`.

### Spacing and Density

- App shell max width: full desktop viewport with 24px page padding.
- Panel gap: 16px.
- Panel padding: 16px.
- Table/list row height: about 40px.
- Map minimum height: 520px on game screens.
- Border radius: 6px to 8px.

### Motion

- Use short transitions, 150-250ms.
- Do not animate layout in ways that shift content.
- Execution steps may fade between steps, but respect
  `prefers-reduced-motion`.

## Accessibility Rules

- Every form input has a visible label.
- Every interactive element has visible focus.
- Buttons show loading and disabled states during API calls.
- Timer status is visible as text, not only color.
- Score changes include `+` or `-` signs and labels.
- Map stations are selectable only when they are real controls; otherwise use
  semantic labels and route list controls.
