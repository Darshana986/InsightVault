# InsightVault Project Tracker

## Current Phase: 5 - AI Processing (Up Next)

---

## Phase Overview

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Project Setup & Planning | ✅ Complete |
| 1 | Project Scaffolding | ✅ Complete |
| 2 | Database Design & Setup | ✅ Complete |
| 3 | Core API Routes | ✅ Complete |
| 4 | Article Extraction | ✅ Complete |
| 5 | AI Processing | 🔜 Up Next |
| 6 | Frontend - Library View | ⏳ Pending |
| 7 | Frontend - Article Detail | ⏳ Pending |
| 8 | Search Implementation | ⏳ Pending |
| 9 | Polish & Deploy | ⏳ Pending |

## Deployment
- **GitHub**: https://github.com/Darshana986/InsightVault
- **Vercel**: Deployed ✅ (auto-deploys on every push to main)

---

## Phase 0-1: Setup & Scaffolding ✅

- Next.js 14 + TypeScript + Tailwind
- GitHub repo + Vercel deployment
- Agentic harness (orchestrator agent, session state)

---

## Phase 2: Database ✅

- Supabase project created
- `articles` table with: id, url, title, content, tldr, takeaways, categories, reading_time, status, user_notes, timestamps
- Row Level Security enabled
- TypeScript types defined

---

## Phase 3: Core API ✅

- `POST /api/articles` - Save new article
- `GET /api/articles` - Fetch all articles
- Error handling and validation

---

## Phase 4: Article Extraction ✅

- Jina Reader API integrated
- Extracts: title, content
- Calculates: reading time (words ÷ 200 wpm)
- Graceful fallback if extraction fails

---

## Phase 5: AI Processing 🔜

### Tasks
- [ ] Get Gemini API key from Google AI Studio
- [ ] Create `src/lib/gemini.ts` client
- [ ] Generate TLDR (2-4 sentences)
- [ ] Generate 3 key takeaways
- [ ] Auto-categorize (AI, Product, Engineering, etc.)
- [ ] Update API to call Gemini after extraction
- [ ] Display AI content in cards

---
  categories    TEXT[]
  reading_time  INTEGER
  status        TEXT DEFAULT 'unread'
  user_notes    TEXT
  created_at    TIMESTAMPTZ
  updated_at    TIMESTAMPTZ
)
```

---

## Tech Stack (Finalized ✅)

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS

### Backend
- Next.js Route Handlers (API routes)

### Database
- Supabase PostgreSQL (free tier)

### AI
- Google Gemini 1.5 Flash (free tier)

### Article Extraction
- Jina Reader API (free tier)

### Deployment
- Vercel (free hobby tier)

### Total Cost: $0/month

---

## Learning Log

Track key concepts learned during development.

| Date | Topic | Notes |
|------|-------|-------|
| 2026-06-04 | Project Start | PRD review, planning |

---

## Notes

- This is a learning project - prioritize understanding over speed
- Document decisions and their reasoning
- Build incrementally, test frequently
