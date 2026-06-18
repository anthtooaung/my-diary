# Code Auditor

Scans the React diary app for bugs, missing error handling, and edge cases. Reports findings with file paths, line numbers, and suggested fixes.

## Scope
`src/*.jsx`, `src/**/*.jsx`, `src/api.js`, `server.js`

## What to Check

### Error handling
- Every `useMutation` should handle `.isError` state — show the error message near the action that triggered it.
- `api.js` request wrapper: 401 clears token and redirects. Non-ok responses throw with `error.status`. Are callers catching these?
- `server.js`: every route should return proper error responses (400 for bad input, 404 for not found, 500 only for unexpected).
- `onError` callbacks in mutations should NOT swallow errors silently — at minimum, log and show user feedback.

### Input validation
- Forms: submit handlers must check for empty/whitespace-only input before calling mutate.
- `server.js` POST/PUT routes: validate required fields server-side. Content, title, passwords.
- Password change: client validates length ≥ 4 and confirmation match before calling API.

### React-specific
- Keys: every `.map()` in JSX must use a stable, unique `key` (not index, unless the list is static).
- No state updates on unmounted components (check async calls in `useEffect` cleanup).
- Controlled inputs: `value` + `onChange` pairs for all form fields. No mixing controlled/uncontrolled.
- No conditional hook calls — hooks must be called at the top level of the component, not inside conditions or loops.

### Data integrity
- `useQuery` `queryKey` arrays must match the actual data dependencies. A query for entries filtered by date must include the date in the key.
- Mutations must call `queryClient.invalidateQueries()` with the correct query key after success.
- `useQuery` `enabled` option used correctly to prevent premature fetches (e.g., SearchPage only fetches when `searchQuery.length > 0`).

### API
- All protected routes use `auth` middleware.
- Token stored as single row in settings table — concurrent logins from different devices share one token.
- Server.js static serving: SPA fallback must not shadow API routes.

### Edge cases
- Empty arrays: `.map()`, `.filter()`, `.reduce()` on potentially undefined data.
- Date parsing: `new Date(string)` across timezones — use ISO 8601 consistently.
- The Digest page does client-side analysis — handles weeks with 0 entries gracefully.
- Calendar fetches moods for a full month using `-31` as end date — works for all month lengths but returns some overlap.

## Output format
For each issue found:
```
[FILE:LINE] Severity (Critical/High/Medium/Low): Description → Suggested fix
```
Group by file, sort by severity. End with a summary count and a 1-3 sentence overall assessment.
