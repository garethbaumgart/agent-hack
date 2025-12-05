# User Story Execution Workflow

This document defines how Claude should approach executing a user story from the `requirements/` folder.

## When to Use This Workflow

Use this workflow when:
- User asks you to implement a specific user story (e.g., "implement US-29")
- User references a story by name (e.g., "build the grid/list view feature")
- User points to a requirements file and asks you to build it

## Workflow Steps

### 1. CLARIFY (Before Writing Any Code)

**Always ask clarifying questions before starting implementation.**

Review the user story and identify:

| Question Type | Examples |
|---------------|----------|
| **Ambiguity** | "The AC says 'user can filter' - should this be a dropdown, chips, or search?" |
| **Edge Cases** | "What happens if there are no notes? Should we show an empty state?" |
| **Dependencies** | "This requires labels - is US-11 (Create Label) already implemented?" |
| **Error Handling** | "What should happen if the API call fails?" |
| **UI/UX Details** | "Should there be a loading spinner while fetching?" |
| **Scope** | "The technical notes mention future enhancements - are those in scope?" |

**Do NOT proceed until the user confirms there are no questions or answers them.**

If the user story is clear and complete, confirm with: "I've reviewed US-XX and the requirements are clear. Ready to proceed?"

### 1b. UPDATE USER STORY (After Clarification)

**Once the user answers clarifying questions, update the user story file with the new information.**

This ensures:
- The requirements file becomes the single source of truth
- Future implementations have complete context
- Decisions are documented, not lost in chat history

**How to update:**

1. Add clarified details to the relevant section (Acceptance Criteria, Technical Notes, or a new "Clarifications" section)
2. Keep the original structure intact
3. Mark new additions clearly if needed

**Example update:**

```markdown
### Acceptance Criteria
- [ ] User can toggle between Grid View and List View
- [ ] Cards have subtle hover effect (clarified)
- [ ] View switch is instant, no animation (clarified)

### Technical Notes
- Store view preference in localStorage (clarified: not backend)
```

**Alternative: Add a Clarifications section:**

```markdown
### Clarifications
- Grid cards: subtle hover effect, no selection state
- View toggle: instant switch, no animation
- Preference storage: localStorage (survives refresh, not browser clear)
```

### 2. UNDERSTAND

Load context from:
- `domain.md` - Understand the business purpose
- `architecture.md` - Understand technical patterns
- Review related existing code

### 3. PLAN

Before coding:
- Identify files to create/modify
- Determine order of implementation (Database → API → UI)
- Note any migrations needed
- List components/services to create

Share your plan briefly with the user.

### 4. BUILD

Implement in this order:
1. **Database** - Entity changes, migrations
2. **API** - Endpoints, handlers, validation
3. **UI** - Components, services, routing

Follow patterns in `architecture.md` and standards in `quality.md`.

### 5. VALIDATE

Before marking complete:
- [ ] Code compiles without errors
- [ ] Manual testing confirms AC is met
- [ ] No regressions in related features

### 6. COMMIT & PUSH

Once the user story is complete and validated:

```bash
git add .
git commit -m "US-XX: <User Story Title>"
git push
```

**Commit message format:**
- Prefix with user story ID (e.g., `US-29:`)
- Use the exact user story title from the requirements file
- Example: `US-29: Toggle Grid and List View`

**Important:**
- Only commit when the full user story is complete
- Do not commit partial implementations
- Push to remote after committing

## Example Interaction

```
User: Implement US-29

Claude: I've reviewed US-29: Toggle Grid and List View. Before I start, I have a few questions:

1. For the Grid View, should cards have a hover effect or selection state?
2. Should the view toggle animate the transition or switch instantly?
3. The AC mentions "persisted preference" - should this survive browser clear (use backend) or just localStorage?

User: 1. Subtle hover effect, 2. Instant switch, 3. localStorage is fine

Claude: Thanks! I'm updating US-29 with these clarifications so they're documented...

✓ Updated requirements/01-notes.md with:
  - Cards have subtle hover effect
  - View switch is instant (no animation)
  - Preference stored in localStorage

Now proceeding with implementation.

[... implements feature ...]

Claude: US-29 is complete. I've verified:
- Grid/List toggle works
- Preference persists in localStorage
- Responsive on mobile

Committing and pushing now...

✓ Committed: "US-29: Toggle Grid and List View"
✓ Pushed to origin/main
```

## Checklist Summary

```
□ Read the user story completely
□ Ask clarifying questions (or confirm none needed)
□ Wait for user response
□ Update user story file with clarifications
□ Load domain.md and architecture.md context
□ Share implementation plan
□ Build: Database → API → UI
□ Validate against acceptance criteria
□ Commit with "US-XX: Title" format
□ Push to remote
```
