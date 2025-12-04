# Tasks

## US-05: Create a Standalone Task

**As an** engineering manager
**I want to** create a task directly on the board
**So that** I can track quick action items without writing a full note

### Acceptance Criteria

- [ ] User can create a task from the Board View
- [ ] User enters task title
- [ ] Task appears in Todo column
- [ ] Board View accessible via sidebar navigation

### Technical Notes
- Labels deferred to future user story (03-Labels.md)
- Due date deferred to US-12 in 03-Labels.md
- Sidebar navigation with Notes and Board links
- Task entity: id, title, status (todo/done), createdAt, updatedAt, completedAt (nullable), noteId (nullable for linked tasks)

---

## US-06: Mark Task Done

**As an** engineering manager
**I want to** mark a task as done
**So that** I can track my progress

### Acceptance Criteria

- [ ] User can mark a task done from the Board View
- [ ] Task moves from Todo to Done column
- [ ] completed_at timestamp is set
- [ ] If task is linked to a note, the checkbox in the note becomes checked

### Technical Notes
- Checkbox on each task card toggles done/todo status
- Note checkbox sync deferred until US-08 (Create Task from Note) is implemented
- PUT /api/tasks/{id}/status endpoint with { status: "done" | "todo" }

---

## US-07: Reopen a Task

**As an** engineering manager
**I want to** reopen a completed task
**So that** I can track work that needs to be redone

### Acceptance Criteria

- [x] User can mark a done task as todo
- [x] Task moves from Done to Todo column
- [x] completed_at is cleared
- [ ] If task is linked to a note, the checkbox in the note becomes unchecked

### Technical Notes
- Implemented as part of US-06 - same checkbox toggle mechanism works bidirectionally
- Unchecking a done task calls PUT /api/tasks/{id}/status with { status: "todo" }
- completed_at is cleared when status changes to "todo"
- Note checkbox sync deferred until US-08 (Create Task from Note) is implemented

---

## US-08: Edit Task Title

**As an** engineering manager
**I want to** edit a task's title
**So that** I can clarify or correct the action item

### Acceptance Criteria

- [ ] User can edit task title from the Board View
- [ ] If task is linked to a note, the checkbox text in the note is updated

### Technical Notes
- Click on task title to turn it into inline text input
- Enter or blur to save, Escape to cancel
- PUT /api/tasks/{id} endpoint with { title: "new title" }
- Note checkbox sync deferred until note-task linking is implemented

---

## US-09: Set Task Due Date

**As an** engineering manager
**I want to** set or change a task's due date
**So that** I can prioritize by deadline

### Acceptance Criteria

- [ ] User can set a due date on any task
- [ ] User can change an existing due date
- [ ] User can remove a due date
- [ ] Task position in Todo column updates based on due date

---

## US-10: Delete a Task

**As an** engineering manager
**I want to** delete a task
**So that** I can remove items that are no longer relevant

### Acceptance Criteria

- [ ] User can delete a task from the Board View
- [ ] If task is linked to a note, the checkbox is removed from the note
- [ ] Task is removed from the system

---

## US-32: In Progress Task Status

**As an** engineering manager
**I want to** mark a task as "In Progress"
**So that** I can distinguish between tasks I haven't started and tasks I'm actively working on

### Acceptance Criteria

- [ ] Board View displays three columns: Todo, In Progress, Done
- [ ] User can drag a task from Todo to In Progress
- [ ] User can drag a task from Done to In Progress
- [ ] User can drag a task from In Progress to Todo
- [ ] User can drag a task from In Progress to Done
- [ ] In Progress column is positioned between Todo and Done
- [ ] started_at timestamp is set when task enters In Progress
- [ ] started_at is cleared when task moves back to Todo

### Drag and Drop Behavior

- [ ] Tasks can only enter In Progress via drag and drop (no checkbox toggle)
- [ ] Dragging from Todo → In Progress: sets started_at
- [ ] Dragging from In Progress → Done: sets completed_at (keeps started_at)
- [ ] Dragging from Done → In Progress: clears completed_at, sets started_at if not already set
- [ ] Dragging from In Progress → Todo: clears started_at
- [ ] Dragging from Done → Todo: clears completed_at and started_at

### Column Sorting

- [ ] Todo: sorted by due date (earliest first, no due date at bottom)
- [ ] In Progress: sorted by started_at (most recently started at top)
- [ ] Done: sorted by completed_at (most recently completed at top)

### Technical Notes

- Task status enum changes from (todo, done) to (todo, in_progress, done)
- Add started_at (nullable timestamp) column to tasks table
- PUT /api/tasks/{id}/status endpoint accepts { status: "todo" | "in_progress" | "done" }
- Use PrimeNG DragDrop or native HTML5 drag-and-drop for column transitions
- Checkbox toggle on task card only toggles between current status and done (does not cycle through all statuses)