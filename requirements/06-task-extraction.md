# Task Extraction & Sync

## US-20: Extract Tasks from Note Checkboxes

**As an** engineering manager
**I want** checkboxes in my notes to automatically become tasks
**So that** I can write naturally and have action items tracked

### Acceptance Criteria

- [ ] When a note is saved, each unchecked checkbox creates a task
- [ ] Task title = checkbox text
- [ ] Task inherits all labels from the note
- [ ] Task links back to the source note
- [ ] Task appears in Todo column on Board View

---

## US-21: Sync Task Completion to Note

**As an** engineering manager
**I want** marking a task done on the board to check the box in the note
**So that** my notes stay in sync with my task status

### Acceptance Criteria

- [ ] When a linked task is marked done, the checkbox in the source note becomes checked
- [ ] When a linked task is reopened, the checkbox in the source note becomes unchecked

---

## US-22: Sync Note Checkbox to Task

**As an** engineering manager
**I want** checking a box in my note to mark the task done
**So that** I can complete tasks from either place

### Acceptance Criteria

- [ ] When a checkbox is checked in the note editor, the linked task moves to Done
- [ ] When a checkbox is unchecked in the note editor, the linked task moves to Todo

---

## US-23: Add New Checkbox to Existing Note

**As an** engineering manager
**I want** new checkboxes added to an existing note to create new tasks
**So that** I can add action items as they come up

### Acceptance Criteria

- [ ] When a note with existing tasks is edited and a new checkbox is added, a new task is created
- [ ] New task inherits current labels from the note
- [ ] Existing tasks are not affected

---

## US-24: Remove Checkbox from Note

**As an** engineering manager
**I want** removing a checkbox from a note to delete the linked task
**So that** my task board stays clean

### Acceptance Criteria

- [ ] When a checkbox is removed from a note, the linked task is deleted
- [ ] If the task was in Done status, it is still deleted

---

## US-25: Edit Checkbox Text in Note

**As an** engineering manager
**I want** editing checkbox text in a note to update the task title
**So that** I can refine action items in context

### Acceptance Criteria

- [ ] When checkbox text is changed in the note editor, the linked task title is updated on save
