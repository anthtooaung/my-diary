# C5 — Rich Text / Markdown Editor Implementation Plan

## Overview
Upgrade the entry writing & reading experience with markdown formatting. Editor gets a toolbar (bold, italic, list, link, blockquote) + preview toggle + auto-save draft to localStorage. All 4 content display locations render markdown as styled HTML.

## Approach
- **Editing**: Keep existing textarea, add toolbar buttons that insert markdown syntax at cursor. Preview tab renders markdown in-place.
- **Rendering**: `react-markdown` + `remark-gfm` — a single `<MarkdownContent>` component used everywhere.
- **SearchPage**: Strip markdown chars from snippet before `<mark>` highlighting (snippet is truncated anyway).
- **Auto-save**: localStorage keyed as `draft_entry`, debounced at 1s, restored on mount.

## Files to Touch (11 files)

| # | File | Action |
|---|------|--------|
| 1 | `package.json` | Add `react-markdown` + `remark-gfm` |
| 2 | `src/components/MarkdownContent.jsx` | **New** — reusable markdown renderer |
| 3 | `src/components/MarkdownToolbar.jsx` | **New** — formatting buttons that insert markdown syntax |
| 4 | `src/components/EntryCard.jsx` | Replace plain `<p>{content}</p>` with `<MarkdownContent>` |
| 5 | `src/pages/CalendarPage.jsx` | Replace plain `<p>{content}</p>` with `<MarkdownContent>` |
| 6 | `src/pages/DigestPage.jsx` | Use `<MarkdownContent>` for highlight text |
| 7 | `src/pages/SearchPage.jsx` | Strip markdown before snippet highlighting |
| 8 | `src/pages/DashboardPage.jsx` | Add toolbar, preview toggle, auto-save draft |
| 9 | `src/hooks/useAutoSave.js` | **New** — debounced localStorage draft save/restore |
| 10 | `knowledges/daily-log.md` | Mark C5 as done |
| 11 | `knowledges/feature-ideas.md` | Mark C5 as done |

## MarkdownToolbar Component

```
┌───────────────────────────────────────────────────────┐
│ [B] [I] [≡] [🔗] ["]  │  Write │ Preview            │
└───────────────────────────────────────────────────────┘
```

Buttons (Phosphor icons):
- **Bold** (`TextB`) — wraps selection in `**text**`
- **Italic** (`TextItalic`) — wraps selection in `*text*`
- **List** (`ListBullets`) — prefixes lines with `- `
- **Link** (`Link`) — inserts `[text](url)` or wraps selection
- **Blockquote** (`Quotes`) — prefixes lines with `> `

Right-aligned: Write/Preview toggle tabs.

## MarkdownContent Component

```jsx
<MarkdownContent>{entry.content}</MarkdownContent>
```

Renders content through `react-markdown` with `remark-gfm`. Uses Tailwind prose-like classes for styling (no `@tailwindcss/typography` needed — manual CSS via `prose-custom` class).

Styling approach: wrap in a `<div className="prose-custom text-sm ...">` with child selectors via Tailwind arbitrary variants or a few utility classes on the rendered elements themselves. Since react-markdown renders plain HTML, we use `components` prop if needed, or just apply a wrapper with `[&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-4` etc.

## DashboardPage Changes

Current layout:
```
<h2>Today's Entry</h2>
<WritingPromptCard />
<form>
  <textarea />       ← write here
  <mood selector />
  <Save Entry btn />
</form>
```

New layout:
```
<h2>Today's Entry</h2>
<WritingPromptCard />
<form>
  <MarkdownToolbar />   ← NEW: formatting buttons + Write/Preview toggle
  <textarea />          ← stays when "Write" tab active
  OR
  <MarkdownContent />   ← NEW: shows when "Preview" tab active
  <mood selector />
  <Save Entry btn />
  <draft restored? />   ← NEW: "Draft restored" indicator
</form>
```

## SearchPage Strategy

The current approach injects `<mark>` tags into raw text and renders via `dangerouslySetInnerHTML`. With markdown, raw text may contain `**`, `*`, `- `, etc.

**Solution**: Before snippet extraction, strip markdown formatting characters from the raw content. This produces clean plain text for the snippet + `<mark>` highlighting pipeline. No structural change to SearchPage logic.

Simple strip function:
```js
function stripMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')   // bold
    .replace(/\*(.+?)\*/g, '$1')        // italic
    .replace(/^[-*]\s/gm, '')           // list markers
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // links
    .replace(/^>\s/gm, '')              // blockquote
}
```

## Edge Cases
- **Existing plain text entries**: Backward compatible — plain text renders fine through react-markdown
- **Partial markdown**: A single `*` won't break — react-markdown handles unclosed markers gracefully
- **Empty draft**: localStorage key removed after save, no stale draft
- **Preview on empty textarea**: Shows nothing or placeholder text
- **Draft vs saved entry conflict**: If an entry was just saved, clear the draft

## Changelog (for daily-log.md)
```
## 2026-06-19 — C5 Rich Text / Markdown Editor

### Done
- [x] Install react-markdown + remark-gfm
- [x] Create MarkdownContent.jsx — reusable safe markdown renderer with prose styling
- [x] Create MarkdownToolbar.jsx — Bold/Italic/List/Link/Blockquote buttons with Write/Preview toggle
- [x] Create useAutoSave.js hook — debounced localStorage draft save and restore
- [x] Update EntryCard.jsx, CalendarPage.jsx, DigestPage.jsx to render markdown
- [x] Update SearchPage.jsx to strip markdown chars before snippet highlighting
- [x] Update DashboardPage.jsx with toolbar, preview toggle, and auto-save draft
```
