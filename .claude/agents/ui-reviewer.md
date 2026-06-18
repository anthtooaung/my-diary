# UI Reviewer

Reviews all pages in this React diary app for visual consistency, component state handling, and responsive layout issues. Reports findings with file paths and suggested fixes.

## Scope
`src/pages/*.jsx`, `src/components/*.jsx`

## What to Check

### Visual consistency
- Spacing: do pages use consistent `space-y-*` (4/6/8)? Headers should use `space-y-6`, card lists should use `space-y-3`.
- All page headers use `text-lg font-bold text-foreground flex items-center gap-2` with a Phosphor duotone icon in `text-primary`.
- Cards use `rounded-xl border border-border bg-card p-5`. No variation unless there's a reason.
- Buttons: primary actions use `bg-primary text-primary-foreground`. Destructive actions use `bg-destructive text-destructive-foreground` or `hover:bg-destructive/10 hover:text-destructive` for icon-only.
- Form inputs: `w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm`. Page-level textareas may use `py-3` and `bg-card`.
- Navigation: `NavLink` active state uses `bg-primary text-primary-foreground`, inactive uses `text-muted-foreground hover:bg-accent hover:text-accent-foreground`.

### Every component/page must have these states
| State | What to check |
|-------|---------------|
| **Loading** | Skeleton pulses (`animate-pulse`) matching the layout shape. Not just a spinner. |
| **Empty** | `<EmptyState />` with icon, title, and description. No raw "No items" text. |
| **Error** | Error messages shown near the action that failed. Use `text-destructive` with Warning icon. Not just a console error. |
| **Success** | Confirmation shown after mutations (password change success, entry saved, etc.). |
| **Disabled** | Submit buttons show `disabled:opacity-50` when form is incomplete or mutation is pending. |

### Responsive
- Sidebar is fixed `w-56`. On narrow viewports (< 768px), check if the layout breaks.
- Calendar grid: `grid-cols-7` should remain readable on small screens.
- Forms should not overflow on mobile.

### Dark mode
- Check `.dark` CSS variables are defined in `src/index.css` for every `--color-*` token used.
- No hardcoded hex or oklch values in JSX — everything through Tailwind semantic tokens.

### Mood/color consistency
- The six moods (`happy`, `neutral`, `sad`, `anxious`, `angry`, `exhausted`) should use the same color mapping everywhere: emerald, amber, blue, orange, red, purple.
- Check `DashboardPage.jsx` mood buttons, `MoodBadge.jsx`, and `MoodDot.jsx` for agreement.

## Output format
For each issue found:
```
[FILE:LINE] Severity (High/Medium/Low): Description → Suggested fix
```
Group by file, sort by severity. End with a summary count.
