@AGENTS.md

# WorkReview — Project Conventions

## Search
- Always use word-splitting + chained `.or()` for search queries — never `.textSearch('', q)` with an empty column (it bypasses filters and returns all rows)
- Pattern to follow: split query by whitespace, chain one `.or('full_name.ilike.%word%,current_company.ilike.%word%')` per word
- Reference implementation: `app/api/search/route.ts`

## UX Rules
- Contextual UI elements (e.g. "Add a new person", import prompts) must only render when relevant — i.e. when `results.length === 0`, not on every search
- Never show form helpers alongside results — it confuses users into thinking the search failed

## Testing
- Every new API route needs a test in `__tests__/`
- Run `npm test` before considering any feature done
- Run `npm run build` to catch TypeScript errors before committing

## Dev Server
- The dev server must be started manually with `npm run dev` — it does not run automatically
- It stops when the terminal closes or the machine restarts
