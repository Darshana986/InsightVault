# InsightVault - Copilot Instructions

## Project Overview

InsightVault is a personal reading operating system that transforms saved articles into searchable, consumable insights. The primary object is the **insight**, not the article URL.

## User Context

- **Background**: Mac/iOS developer learning web development
- **Needs**: Explanations of web concepts, mappings to iOS equivalents
- **Goal**: Build MVP while learning

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | Next.js 14 (App Router) | File-based routing |
| Language | TypeScript | Strict mode enabled |
| Styling | Tailwind CSS | Utility-first |
| Database | Supabase (PostgreSQL) | Free tier |
| AI | Google Gemini 1.5 Flash | Free tier |
| Extraction | Jina Reader API | Free tier |
| Deployment | Vercel | Auto-deploy from main |

## Project Structure

```
InsightVault/
├── docs/                         # Documentation
│   ├── PRD-v1.md                # Product requirements
│   ├── PROJECT-TRACKER.md       # Phase progress
│   └── SESSION-STATE.md         # Resumption point
│
└── app/                          # Next.js application
    ├── src/
    │   ├── app/                  # Pages (file-based routing)
    │   │   ├── layout.tsx       # Root layout
    │   │   ├── page.tsx         # Home (/)
    │   │   ├── api/             # API routes
    │   │   └── [future routes]
    │   ├── components/          # React components
    │   └── lib/                 # Utilities, clients
    ├── .env.local               # Environment variables (gitignored)
    └── .github/agents/          # Agent definitions
```

## Coding Conventions

### TypeScript
- Use explicit types, avoid `any`
- Prefer interfaces over type aliases for objects
- Use `const` by default

### React/Next.js
- Use Server Components by default
- Add `'use client'` only when needed (interactivity)
- Use Next.js App Router conventions

### Naming
- Components: PascalCase (`ArticleCard.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- API routes: kebab-case (`/api/save-article`)

### File Organization
- One component per file
- Colocate related files (component + styles + tests)

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Gemini (add in Phase 5)
GEMINI_API_KEY=xxx
```

## Key Commands

```bash
# Development
cd app && npm run dev     # Start dev server (localhost:3000)
npm run build             # Production build
npm run lint              # Run ESLint

# Git
git add . && git commit -m "message" && git push   # Deploy to Vercel
```

## Session Resumption

To resume development after a break:
1. Check `docs/SESSION-STATE.md` for exact position
2. Check `docs/PROJECT-TRACKER.md` for phase overview
3. Or invoke `@orchestrator` agent

## Cost Constraint

**Total budget: $0/month** - Use only free tiers.
