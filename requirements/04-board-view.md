# Board View

## US-15: View Task Board

**As an** engineering manager
**I want to** see all my tasks on a board
**So that** I can see what needs to be done at a glance

### Acceptance Criteria

- [ ] Board shows two columns: Todo and Done
- [ ] Todo tasks sorted by due date (earliest first, no due date at bottom)
- [ ] Done tasks sorted by completed_at (most recent first)
- [ ] Each task card shows: title, labels, due date (if set), link icon (if from a note)

---

## US-16: Navigate to Source Note

**As an** engineering manager
**I want to** click a task to see its source note
**So that** I can get context on why the task exists

### Acceptance Criteria

- [ ] Tasks extracted from notes show a link icon
- [ ] Clicking the link icon opens the source note in the editor
- [ ] Standalone tasks do not show a link icon

---

## US-17: Filter Board by Label

**As an** engineering manager
**I want to** filter the board to show only tasks with a specific label
**So that** I can focus on one person or project

### Acceptance Criteria

- [ ] User can select a label to filter by
- [ ] Only tasks with that label are shown
- [ ] User can clear the filter to see all tasks
