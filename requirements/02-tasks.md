# Tasks

## US-05: Create a Standalone Task

**As an** engineering manager
**I want to** create a task directly on the board
**So that** I can track quick action items without writing a full note

### Acceptance Criteria

- [ ] User can create a task from the Board View
- [ ] User enters task title
- [ ] User can optionally add labels
- [ ] User can optionally add a due date
- [ ] Task appears in Todo column

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

---

## US-07: Reopen a Task

**As an** engineering manager
**I want to** reopen a completed task
**So that** I can track work that needs to be redone

### Acceptance Criteria

- [ ] User can mark a done task as todo
- [ ] Task moves from Done to Todo column
- [ ] completed_at is cleared
- [ ] If task is linked to a note, the checkbox in the note becomes unchecked

---

## US-08: Edit Task Title

**As an** engineering manager
**I want to** edit a task's title
**So that** I can clarify or correct the action item

### Acceptance Criteria

- [ ] User can edit task title from the Board View
- [ ] If task is linked to a note, the checkbox text in the note is updated

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
