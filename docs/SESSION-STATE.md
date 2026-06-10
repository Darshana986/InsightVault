# InsightVault Session State

> This file tracks the exact state for session resumption.
> Updated after each significant milestone.

---

## Current State

**Last Updated**: 2026-06-10
**Current Phase**: 5 Complete + Schema Refactor + Reliability Hardening
**Status**: Full MVP live at insight-vault-rouge.vercel.app

---

## Completed Phases

- ✅ **Phase 0**: Planning - PRD saved, tech stack decided
- ✅ **Phase 1**: Scaffolding - Next.js project, GitHub repo, Vercel deploy
- ✅ **Phase 2**: Database - Supabase project, articles table, RLS policies
- ✅ **Phase 3**: Core API - POST/GET/DELETE endpoints, basic CRUD working
- ✅ **Phase 4**: Article Extraction - Jina Reader integrated, titles + reading time extracted
- ✅ **Phase 5**: AI Processing - Gemini + Groq fallback integrated, analysis/categories model
- ✅ **UX Improvements**:
  - **Instant save** (<200ms) - URL saved immediately, processing via polling
  - Shimmering placeholders while loading
  - Auto-polling triggers Jina + AI on first poll
  - Error handling with retry button
  - Expandable content (More/Less)
- ✅ **UX Redesign** (2026-06-07):
  - **Replaced TLDR + Takeaways with single "Gist"** - Conversational, no fluff format
  - Gist supports bold (**text**) and paragraphs
  - No more separate sections - just one comprehensive summary
- ✅ **AI Reliability** (2026-06-10):
  - **Added Groq as fallback** when Gemini is rate limited (Llama 3.1 8B)
  - Automatic fallback on 429, 503, or 404 errors
  - Fixed JSON parsing issues in both providers
  - Added Jina fallback (`Jina -> direct HTML extraction`) for blocked/rate-limited cases
  - Reduced Groq payload size to avoid 413 token overflow errors
  - Fixed Vercel caching with `force-dynamic`
- ✅ **Schema Refactor** (2026-06-10):
  - Migrated `articles` table from `tldr/takeaways` to `analysis`
  - Updated app/API/types to use `analysis + categories` only
  - Added migration SQL under `docs/sql/2026-06-10-articles-analysis-migration.sql`
- ✅ **Production**: Live on Vercel (auto-deploys from GitHub)

---

## TODO (On Request)

When user resumes and asks for these, implement them:

### UX/UI Improvements
- [x] **Restructure TLDR & Key Takeaways** - ✅ Done! Replaced with single conversational "gist"
- [ ] **Unread state management** - Make it more intuitive (visual cues, click to mark read)

### Performance
- [ ] **Delete is slow** - Investigate why delete takes time, optimize
- [ ] **Fix useEffect dependency warning** - Change from multiple deps to single stable dep (`[localArticle.id]` only, check values inside effect)

### Features
- [ ] **Search provision** - Search articles by title/content/tags
- [ ] **Filter provision** - Filter by status (unread/read/starred), categories, date
- [ ] **Paywall/signin handling** - For Medium/Substack, leverage user's existing session if logged in (may need browser extension or different approach)

### Production Checklist
- [x] Add `GROQ_API_KEY` to Vercel environment variables

---

## Immediate Next Steps

1. Monitor production saves with long articles to confirm fallback stability.
2. Reduce per-card polling traffic in `ArticleCard` to cut repeated GET requests.
3. Implement unread-state UX improvements.
4. Start search + filter features.

---

## Project Structure (Current)

```
InsightVault/
├── docs/                           # 📚 Documentation
│   ├── PRD-v1.md                  # Product requirements
│   ├── PROJECT-TRACKER.md         # Phase-level progress
│   ├── SESSION-STATE.md           # ← YOU ARE HERE (resumption point)
│   └── sql/
│       └── 2026-06-10-articles-analysis-migration.sql
│
└── app/                            # 🚀 Next.js Application
    ├── .github/
    │   ├── agents/
    │   │   └── orchestrator.agent.md  # Session continuity agent
    │   └── prompts/
    │       ├── resume.prompt.md       # /resume command
    │       └── sync.prompt.md         # /sync command (commit + update state)
    │
    ├── src/
    │   ├── app/                    # 📱 PAGES (file-based routing)
    │   │   ├── layout.tsx         # Root layout
    │   │   ├── page.tsx           # Home page → localhost:3000/
    │   │   └── api/
    │   │       └── articles/
    │   │           ├── route.ts       # POST/GET endpoints
    │   │           └── [id]/route.ts  # GET/DELETE/PATCH by ID
    │   │
    │   ├── components/            # 🧩 REACT COMPONENTS
    │   │   ├── SaveArticleForm.tsx
    │   │   ├── ArticleList.tsx
    │   │   └── ArticleCard.tsx    # With polling, retry, expand
    │   │
    │   └── lib/                   # 🔧 UTILITIES
    │       ├── supabase.ts        # Database client
    │       ├── database.types.ts  # TypeScript types (analysis + categories)
    │       ├── jina.ts            # Article extraction
    │       ├── gemini.ts          # AI analysis (primary)
    │       └── groq.ts            # AI analysis (fallback - Llama 3.1 8B)
    │
    ├── .env.local                 # 🔐 Secrets (gitignored)
    └── package.json               # Dependencies
```

---

## How to Resume (New Session)

**Option 1 - Use /resume command:**
```
/resume
```

**Option 2 - Ask directly:**
```
Continue building InsightVault. Read docs/SESSION-STATE.md for current state.
```

**Option 3 - Quick context:**
```
InsightVault MVP complete: instant save, Jina extraction, Gemini AI analysis,
error handling with retry. Ready for Phase 6 (polish/deploy).
```

---

## How to Sync (Commit + Update State)

**Use /sync command:**
```
/sync
```
This will commit changes to git, push, and update SESSION-STATE.md.

---

## Environment Variables Status

| Variable | Status | Notes |
|----------|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Set | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Set | Supabase anon key |
| `GEMINI_API_KEY` | ✅ Set | Primary AI provider |
| `GROQ_API_KEY` | ✅ Set | Fallback AI provider |
| `JINA_API_KEY` | Optional | If set, Jina requests use bearer auth |

---

## Git Status

Working tree typically clean after sync commits.
