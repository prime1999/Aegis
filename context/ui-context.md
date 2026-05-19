# UI Context

## Theme

Light only. No dark mode. The visual language is a light technical workspace — near-white backgrounds, layered surfaces, and vivid accent colors for interactive elements.

All colors are defined as CSS custom properties in `globals.css` and mapped to Tailwind tokens via `@theme inline`. Components must use these tokens — no hardcoded hex values or raw Tailwind color classes like `zinc-*`.

## Colors

[Define your color tokens as CSS custom properties.
All components must use these tokens — no hardcoded
hex values.]

| Role             | CSS Variable    | Hex / Value |
| ---------------- | --------------- | ----------- |
| Page background  | `--bg-base`     | `#FFFFFF`   |
| Surface          | `--bg-surface`  | `#F9FAFB`   |
| Elevated surface | `--bg-elevated` | `#F3F4F6`   |
| Subtle surface   | `--bg-subtle`   | `#EEF2F7`   |

| Default border | `--border-default` | `#E5E7EB` |
| Subtle border | `--border-subtle` | `#D1D5DB` |

| Primary text | `--text-primary` | `#111827` |
| Secondary text | `--text-secondary` | `#4B5563` |
| Muted text | `--text-muted` | `#6B7280` |
| Faint text | `--text-faint` | `#9CA3AF` |

| Brand accent | `--accent-primary` | `#3B82F6` |
| Brand hover | `--accent-hover` | `#2563EB` |
| Brand active | `--accent-active` | `#1D4ED8` |
| Brand dim | `--accent-primary-dim`| `rgba(59, 130, 246, 0.12)` |

| AI accent | `--accent-ai` | `#60A5FA` |
| AI text | `--accent-ai-text` | `#3B82F6` |

| Error | `--state-error` | `#EF4444` |
| Success | `--state-success` | `#22C55E` |
| Warning | `--state-warning` | `#F59E0B` |

## Typography

| Role      | Font       | Variable            |
| --------- | ---------- | ------------------- |
| logo      | Jura       | `--font-jura`       |
| UI text   | Geist Sans | `--font-geist-sans` |
| Code/mono | Geist Mono | `--font-geist-mono` |

Both fonts are loaded via `next/font/google` and applied as CSS variables on the `<html>` element. The base `body` uses Geist Sans with `antialiased`.

## Border Radius

| Context           | Class        |
| ----------------- | ------------ |
| Inline / small UI | `rounded-lg` |
| Cards / panels    | `rounded-lg` |
| Modal / overlay   | `rounded-lg` |

## Component Library

- shadcn/ui on top of TailwindCSS
- All components live in `components/ui/`
- Use the shadcn CLI to add components instead of manually building base UI primitives
- Extend components only at the application layer (never modify base UI primitives directly)
- UI styling follows Aegis design system (light mode, blue accent, neutral gray structure)
- Components should prioritize:
  - readability
  - spacing clarity
  - financial dashboard feel
  - AI chat usability

---

## Layout Patterns

- **Dashboard Layout**
  - Full-page layout with top navigation
  - Main content centered with max width container (xl–2xl)
  - Right panel used for AI insights / wallet intelligence summary
  - fixed bottom panel with a box of buttons for the user to use

- **AI Chat Interface**
  - Split layout:
    - center: chat conversation
  - Sticky input bar at bottom of chat area

- **Wallet Analytics View**
  - Card-based grid layout
  - Top summary row (balance, PnL, exposure)
  - Below: transaction history table + token breakdown

- **Modals**
  - Centered overlay
  - Soft blur backdrop (`backdrop-blur-md`)
  - Used for:
    - intent confirmation
    - transaction simulation review
    - wallet connection flow

- **Navigation Bar**
  - Top fixed bar
  - White background with subtle bottom border (`#E5E7EB`)
  - Left: logo (black for light mode)
  - Right: wallet status + profile + settings

---

## Icons

Lucide React. Stroke-based icons only — no filled variants. Icon sizes: `h-4 w-4` for inline, `h-5 w-5` for buttons, `h-8 w-8` for feature icons in empty states.
