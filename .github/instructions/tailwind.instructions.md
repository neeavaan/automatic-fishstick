---
applyTo: "**/*.tsx,**/*.css"
---

# Tailwind CSS & Mobile-First Design

## Core Rules

- Use Tailwind utility classes directly — no custom CSS unless Tailwind cannot express it.
- Use `cn()` helper (`clsx` + `tailwind-merge`) for conditional class composition.
- Extract repeated class patterns into reusable components, not `@apply` rules.

## Mobile-First

- Base styles target mobile viewports (< 640px).
- Use `sm:`, `md:`, `lg:` for progressively wider layouts.
- Tab navigation: bottom tab bar on mobile, horizontal tabs on `md:` and above.
- All touch targets minimum 44×44px.

## Responsive Data Tables

- Mobile (< 768px): stacked card layout or horizontal scroll with fixed first column.
- Desktop (`md:` and above): traditional table layout.
- Sort/filter controls must remain accessible on all viewports.
- Pagination controls must be touch-friendly.

## Responsive Actions

- Buttons reachable without excessive scrolling on small screens.
- Confirmation dialogs centered and sized for mobile viewports.
- Notifications must not obscure primary content on narrow screens.
- Disabled state and tooltips must be accessible via tap, not just hover.

## shadcn/ui

- Components live in `src/components/ui/` — they are copied, not installed as a dependency.
- Use Radix primitives through shadcn for dialogs, dropdowns, tooltips, toasts.
- Style customizations go on the shadcn component, not in separate CSS.
