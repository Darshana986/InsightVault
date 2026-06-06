# Product Requirements Document (PRD)

## Product Name

Working Name: InsightVault

Tagline:
Turn articles into insights, not bookmarks.

---

# Problem Statement

Users discover valuable articles across multiple platforms such as Substack, Medium, blogs, newsletters, and social media.

Most articles are bookmarked, left open in tabs, or saved for later, but are rarely revisited.

Current bookmarking systems optimize for storage of links rather than retrieval of knowledge.

Users need a unified place to:

* Save articles from anywhere
* Quickly understand article value
* Decide whether an article is worth reading
* Organize content automatically
* Rediscover useful knowledge later

---

# Vision

Build a personal reading operating system that transforms articles into searchable, consumable insights.

The primary object is not the article.

The primary object is the insight extracted from the article.

---

# Target User

Initial User:
Founder / Builder / Developer / Product-minded reader

Characteristics:

* Reads across multiple platforms
* Saves more content than they consume
* Suffers from bookmark overload
* Wants faster learning
* Prefers bite-sized information before deep reading
* Uses content as input for writing and idea generation

---

# Core User Problems

## Problem 1

Too many saved articles across multiple platforms.

Current behavior:

* Browser bookmarks
* Open tabs
* Saved posts
* Notes
* Reading lists

Result:

Information fragmentation.

---

## Problem 2

Articles are often long and require significant commitment before revealing useful insights.

User wants:

* TLDR
* Key takeaway
* Reading-worthiness assessment

Before committing to reading.

---

## Problem 3

User forgets why an article was saved.

Months later the bookmark has little context.

---

## Problem 4

Manual tagging and organization creates friction.

Users do not want to maintain folders and taxonomies.

---

## Problem 5

Knowledge is not easily rediscoverable.

Users remember ideas, not URLs.

---

# Product Principles

1. Insight First

Show insights before showing links.

2. No Manual Organization

AI performs categorization.

3. Reduce Cognitive Load

Everything should require minimal effort.

4. Retrieval Over Storage

Optimize for finding useful knowledge later.

5. Reading Momentum

Make saved content more engaging than another social feed.

---

# MVP Scope

## Feature 1: Save Article

User pastes URL.

System:

* Fetch article
* Extract readable content
* Generate metadata
* Save article

Input:

URL

Output:

Article record stored.

---

## Feature 2: AI Processing

For every article generate:

### Title

Extract article title.

### TLDR

2-4 sentence summary.

### TLDR

2-4 sentence summary.

### Key Takeaways

Exactly 3 concise takeaways.

### Auto Categories

Examples:

* Product
* AI
* Engineering
* Business
* Startups
* Leadership
* Marketing

Multiple categories allowed.

### Reading Time

Estimated reading time.

---

## Feature 3: Library

Default landing page.

Displays saved articles.

View Modes:

### Grid View

Insight cards.

### List View

Compact browsing.

---

## Feature 4: Insight Card

Card displays:

Title

Primary takeaway

Categories

Reading time

Save date

Status

Example:

Title

Key takeaway

AI + Product

7 min read

Saved 3 days ago

---

## Feature 5: Article Detail Page

When clicking card:

Display:

Title

Original URL

TLDR

3 Takeaways

AI Categories

User Notes

Open Original Article button

Optional Reader Mode

---

## Feature 6: Status System

Three states:

Unread

Read

Read Again

Purpose:

Help create intentional reading queues.

---

## Feature 7: Search

Search across:

Title

Summary

Takeaways

Categories

User Notes

Search should retrieve ideas, not just titles.

---

# AI Requirements

## Summarization

Generate:

TLDR

3 Takeaways

Must be concise.

No fluff.

No marketing language.

---

## Categorization

Automatically assign categories.

Multiple categories allowed.

No manual tagging required.

---

# Out of Scope (V1)

* Social features
* Public profiles
* Followers
* Team workspaces
* AI chat over articles
* Vector search
* Recommendation engine
* Browser extension
* Mobile app
* Premise alignment scoring
* Clickbait detection
* Sales-pitch detection
* Reminder scheduling
* Substack publishing integration

These may be future features.

---

# V2 Candidate Features

## Multiple Summary Styles

Standard

Product Lens

Developer Lens

Founder Lens

Casual Mode

Humorous Mode

---

## Read Later Reminders

Snooze:

Tonight

Tomorrow

Weekend

---

## Noise Detection

Identify:

* Excessive promotion
* Tool marketing
* Sponsor-heavy content

---

## Premise Alignment Score

Evaluate whether article delivers on title promise.

---

## Substack Export

Convert article takeaways into:

* Notes
* Draft posts
* Idea seeds

---

# User Flow

Save Article

Paste URL
→ Extract Content
→ Generate AI Summary
→ Auto Categorize
→ Save

Browse Library

Open App
→ Grid/List
→ Search
→ Open Article

Consume

View TLDR
→ View Takeaways
→ Read Full Article
→ Mark Read

Revisit

Search Topic
→ Find Saved Insight
→ Reuse Knowledge

---

# Success Metrics

Personal MVP Metrics

1. Number of articles saved

2. Number of saved articles revisited

3. Search usage frequency

4. Percentage of articles marked Read

5. Percentage of articles marked Read Again

North Star Metric:

Saved insight successfully rediscovered and used later.

---

# Tech Stack (Finalized)

Frontend

* Next.js 14 (App Router)
* TypeScript
* Tailwind CSS

Backend

* Next.js API routes (Route Handlers)

Database

* Supabase (PostgreSQL)
* Full-text search via PostgreSQL tsvector

AI

* Google Gemini 1.5 Flash (FREE tier: 15 req/min, 1M tokens/day)

Article Extraction

* Jina Reader API (FREE tier)

Deployment

* Vercel (FREE hobby tier)

## Cost

$0/month for MVP development and personal use.

---

# MVP Goal

A user can paste an article URL and within seconds receive:

* TLDR
* Key takeaways
* Auto categorization

which is permanently stored in a searchable personal knowledge library.
