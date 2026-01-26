# Web Interface Guidelines

Based on [Vercel Design Guidelines](https://vercel.com/design/guidelines).

## Interactions
- **Keyboard Config:** Ensure all flows are keyboard-operable.
- **Clear Focus:** Visible focus rings for all focusable elements.
- **Touch Targets:** Minimal hit target size of 24px (44px on mobile).
- **Loading States:** Show loading indicators, keep original labels, prevent layout shift.
- **URL Sync:** Persist state in URL (search, filters, etc.).
- **Optimistic UI:** Update UI immediately on action, reconcile later.

## Layout
- **Alignment:** Deliberate alignment to grid or optical center.
- **Responsiveness:** Verify on mobile, laptop, and ultra-wide.
- **Scrollbars:** Avoid excessive scrollbars.
- **Native Sizing:** Prefer flex/grid over JS sizing.

## Design
- **Shadows:** Layered shadows for depth.
- **Borders:** Crisp borders combined with shadows.
- **Consistency:** Consistent hue for non-neutral backgrounds.
- **Contrast:** High contrast for text and interactions.
- **Theme:** Match browser theme color to page background.

## Performance
- **Hydration:** Inputs must not lose focus/value on hydration.
- **Feedback:** Immediate feedback for user actions.
