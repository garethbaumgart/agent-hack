# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Workflow

### For New Features / User Stories

```
1. CLARIFY     → Ask questions before starting (see below)
2. UNDERSTAND  → What problem? Who uses it? (load domain.md)
3. DESIGN      → How should it work? (load architecture.md)
4. BUILD       → Database → API → UI (reference quality.md)
5. VALIDATE    → Does it work? Does it meet the need?
```

**Before executing on a user story or requirement, always ask clarifying questions:**

- What is unclear or ambiguous in the acceptance criteria?
- Are there edge cases not covered?
- Are there dependencies on other stories?
- What should happen on error?
- Are there UI/UX details missing (e.g., loading states, empty states)?
- Does this conflict with or duplicate existing functionality?

Do NOT start implementation until the user has answered your questions or confirmed there are none.

### For Bug Fixes

```
1. REPRODUCE   → Confirm the issue
2. DIAGNOSE    → Find root cause
3. FIX         → Implement solution
4. TEST        → Verify fix, check for regressions
```

### For Performance Issues

```
1. MEASURE     → Profile and identify bottlenecks
2. ANALYZE     → Understand the cause
3. OPTIMIZE    → Apply targeted fixes
4. VERIFY      → Confirm improvement
```

## Context Files

Load relevant context based on your task:

| Context | When to Load | File |
|---------|--------------|------|
| **Domain** | Business decisions, user workflows, feature validation | `domain.md` |
| **Architecture** | Technical design, code patterns, stack decisions | `architecture.md` |
| **Quality** | Testing, deployment, definition of done | `quality.md` |
| **User Story Workflow** | Implementing a user story from `requirements/` | `user-story-workflow.md` |

### Executing User Stories

When asked to implement a user story (e.g., "implement US-29" or "build the grid view feature"):

1. **Load `user-story-workflow.md`** - Follow the complete workflow defined there
2. **Always ask clarifying questions first** - Do not start coding until questions are answered
3. **Commit with user story ID** - Use format `US-XX: Title` and push when complete

See `user-story-workflow.md` for the full step-by-step process.

### How to Use Contexts

When working on a task, mentally load the relevant context:
- "Should this feature exist?" → domain.md
- "How should I build this?" → architecture.md
- "Is this ready to ship?" → quality.md

For complex features, you'll reference all three. For a quick bug fix, you might only need architecture.md.

## Development Commands

```bash
# Backend API
cd src/Web
dotnet run

# Frontend
cd src/Angular
ng serve

# Run all tests
dotnet test
cd src/Angular && ng test

# Database migrations
cd src/Web
dotnet ef migrations add MigrationName
dotnet ef database update
```

## Decision Framework

### When Facing Trade-offs

1. **Mobile-first always wins** - If it doesn't work on a phone, redesign it
2. **Simplicity over flexibility** - Build what's needed now, not what might be needed
3. **User value over technical elegance** - A working feature beats a perfect architecture
4. **Standards over creativity** - Use PrimeNG components, Tailwind utilities, established patterns

### When Uncertain

Ask these questions:
1. Does this solve a real problem for users?
2. Can users complete this task easily on mobile?
3. Does this follow our established patterns?
4. Is this the simplest solution that works?

## Quick Reference

### Database Naming
- Tables: `snake_case` plural (e.g., `users`, `audit_logs`)
- Columns: `snake_case` (e.g., `created_at`, `user_id`)
- Primary keys: UUID

### API Naming
- Routes: kebab-case plural (e.g., `/api/users`, `/api/audit-logs`)
- REST verbs: GET (list/get), POST (create), PUT (update), DELETE (remove)

### Frontend Naming
- Components: PascalCase (e.g., `UserListComponent`)
- Files: kebab-case (e.g., `user-list.component.ts`)
- Services: PascalCase with Service suffix (e.g., `UserService`)

### File Locations
- Backend: `src/Web/`
- Frontend: `src/Angular/src/app/`
- Documentation: `documentation/`
