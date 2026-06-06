---
mode: agent
description: Commit changes to git, push, and update SESSION-STATE.md
---

# Sync InsightVault

You are syncing the InsightVault project. Perform these steps:

## 1. Check for Changes
```bash
cd "/Users/darshana-8393/Documents/Agent workflows/InsightVault/app"
git status
```

## 2. If Changes Exist
- Stage all changes: `git add -A`
- Ask user for a brief description of what was done
- Commit with a descriptive message
- Push to origin

## 3. Update SESSION-STATE.md
Read the current state from `/Users/darshana-8393/Documents/Agent workflows/InsightVault/docs/SESSION-STATE.md` and update:
- **Last Updated** date
- **Current Phase** and **Status**
- **Completed Phases** list (add new items if needed)
- **Immediate Next Steps** (update based on what's pending)
- **Project Structure** (if new files were added)

## 4. Commit the State Update
```bash
git add docs/SESSION-STATE.md
git commit -m "docs: update session state"
git push
```

## 5. Confirm to User
Report:
- What was committed
- Current project status
- Suggested next steps
