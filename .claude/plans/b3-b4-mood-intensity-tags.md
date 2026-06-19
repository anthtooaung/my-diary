# B3 — Mood Intensity + B4 — Tags

## B3 — Mood Intensity (1-5 scale)

### DB
- `ALTER TABLE entries ADD COLUMN intensity INTEGER CHECK(intensity >= 1 AND intensity <= 5)`

### Server
- `PUT /api/entries/:id`: accept `intensity` field (1-5 or null)
- Schema validation on server isn't strict — frontend validates

### Frontend
| File | Change |
|------|--------|
| `src/lib/schemas.js` | Add `intensity` to entrySchema (optional, 1-5) |
| `src/pages/DashboardPage.jsx` | After mood selected, show 1-5 slider/dots |
| `src/components/EntryCard.jsx` | Show intensity dots next to mood badge (edit mode: intensity selector) |
| `src/components/MoodDot.jsx` | Accept intensity prop, adjust opacity/size |

### UI
```
Mood: [😊 Happy]  Intensity: ○○○●○  (3)
```
5 small circles, click to set. Or a simple number row.

---

## B4 — Tags on Entries

### DB
- `ALTER TABLE entries ADD COLUMN tags TEXT` — comma-separated string

### Server
- `PUT /api/entries/:id`: accept `tags` field
- `GET /api/entries`: accept `tag` filter query param → `WHERE tags LIKE '%tag%'`

### Frontend
| File | Change |
|------|--------|
| `src/pages/DashboardPage.jsx` | Add tag input (comma-separated, e.g. `#work, #health`) below mood selector |
| `src/components/EntryCard.jsx` | Show tag chips (colored badges) |
| `src/pages/SearchPage.jsx` | Add tag filtering UI (tag cloud or tag chips to click) |

### Tags UI
```
Tags: #work   #family   #health   [+ add tag]
```
Simple chips, click to add/remove preset tags.

---

## Total files: ~10 files, all changes within existing files

## Changelog
```
## 2026-06-19 — B3 Mood Intensity & B4 Tags

### Done
- [x] B3: Add intensity column to entries table with CHECK constraint
- [x] B3: Extend server to handle intensity field
- [x] B3: Intensity 1-5 selector in DashboardPage form (after mood pick)
- [x] B3: Intensity display on EntryCard and MoodDot
- [x] B4: Add tags column to entries table
- [x] B4: Extend server to handle tags field + tag filter on GET /api/entries
- [x] B4: Tag input on DashboardPage form (comma-separated)
- [x] B4: Tag chips on EntryCard
- [x] B4: Tag filter on SearchPage
```
