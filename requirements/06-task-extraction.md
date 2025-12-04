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
- [ ] Checkboxes are visually distinct (accent color, standout styling) to indicate they are tracked tasks

### Technical Notes

- Any checkbox created via toolbar, markdown `- [ ]`, or `/task` slash command creates a task
- All checkboxes in notes are tasks - no distinction between "regular" and "task" checkboxes
- `/task` is an optional shortcut that inserts a checkbox

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

---

## US-26: Create Task via Slash Command

**As an** engineering manager
**I want** to type `/task` to quickly insert a task checkbox
**So that** I can add action items without leaving the keyboard

### Acceptance Criteria

- [ ] Typing `/task` in the note editor inserts a checkbox at the cursor position
- [ ] User can immediately type the task title inline
- [ ] Task is created when the note is saved (same as any other checkbox)
- [ ] Slash command works anywhere in the note content

### Technical Notes

- This is a convenience shortcut - functionally identical to inserting a checkbox via toolbar
- Tiptap supports slash commands via the Suggestion extension
- Future: Could expand to `/task Buy milk @tomorrow #shopping` for inline due dates and labels

---

## US-27: Set Task Due Date from Note

**As an** engineering manager
**I want** to set a due date on a task directly from the note
**So that** I can prioritize without switching to the board

### Acceptance Criteria

- [ ] User can set a due date on a task checkbox in the note editor
- [ ] Due date is displayed next to the checkbox (subtle, non-intrusive)
- [ ] Due date syncs with the task on the board
- [ ] User can change or remove the due date from the note

### Technical Notes

- UI option: Click on checkbox to reveal task details popover (due date, labels, link to board)
- Alternative: Inline date picker icon next to checkbox
- Due date changes saved when note is saved

---

## US-28: View Task Labels from Note

**As an** engineering manager
**I want** to see which labels are on a task directly in the note
**So that** I have full context without leaving the editor

### Acceptance Criteria

- [ ] Task checkboxes display their labels (small chips/tags)
- [ ] Labels are inherited from the note by default
- [ ] Labels stay in sync with the task on the board

### Technical Notes

- Labels shown inline after checkbox text or below it
- Read-only display in MVP - editing labels on individual tasks deferred to future story
