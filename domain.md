# MyNote Domain

## Problem Statement

Engineering managers need to track work across people, projects, and meetings. Notes and tasks are fundamentally different things, but most tools mix them together:

- **Notes** are records — they don't have a status
- **Tasks** are actions — they have a lifecycle (todo → done)

When you put both in a Kanban board, neither works well.

### Current Pain Points (from Notion usage)

- Kanban columns don't work well when mixing notes and tasks
- People cards (Greg, Sok, Matt T) sit in "In Progress" forever — they're not tasks, they're reference pages
- Projects, meetings, and action items all look the same on the board
- Hard to prepare for 1:1s — need to find all notes about a person scattered across the board
- Tasks stuck in "In Progress" forever (because they're actually notes, not tasks)
- Too many items to scan visually (~87+ items across columns)
- Lost context — tasks disconnected from where they originated
- No easy way to see "everything related to Greg" or "everything about Project X"

### Core User Need

> See everything related to a person or project in one place, while keeping tasks actionable and notes accessible.

---

## Solution

A **note-first system** where:

1. **Notes are the source of truth** — free-form text, always labeled
2. **Tasks are extracted from notes** — checkboxes become tasks on a board
3. **Labels connect everything** — click a label to see all related notes and tasks
4. **Tasks link back to context** — every task knows where it came from

---

## Core Entities

### Note

A free-form text entry for capturing meeting notes, thoughts, or reference information.

| Property | Description |
|----------|-------------|
| id | Unique identifier |
| content | Rich text with markdown and checkboxes |
| labels | One or more labels |
| created_at | When created |
| updated_at | When last modified |

### Task

An actionable item with a completion state. Can originate from a note or be standalone.

| Property | Description |
|----------|-------------|
| id | Unique identifier |
| title | The task description |
| status | `todo` or `done` |
| due_date | Optional date |
| labels | One or more labels (inherited from note, or manually added) |
| note_id | Link to source note (null for standalone tasks) |
| completed_at | When marked done (null if not done) |
| created_at | When created |
| updated_at | When last modified |

**Task ordering:**
- Todo tasks sorted by due date (earliest first)
- Tasks without due date appear at the bottom
- Done tasks sorted by completed_at (most recent first)

### Label

A tag that connects related notes and tasks.

| Property | Description |
|----------|-------------|
| id | Unique identifier |
| name | The label text (e.g., "Greg", "FileGateway", "Leadership Sync") |

**Label behavior:**
- Flat (no hierarchy)
- Created on-the-fly via autocomplete
- Shared across notes and tasks

---

## User Workflows

### Taking meeting notes

1. Create a new note
2. Add labels (e.g., `Greg`, `1:1`) via autocomplete
3. Write free-form notes with checkboxes for action items:
   ```
   Discussed promotion timeline. Feeling good about Q1.
   - [ ] Send promotion criteria doc
   - [ ] Follow up on AWS cert progress
   ```
4. On save, checkboxes become tasks on the board
5. Tasks inherit all labels from the parent note

### Working through tasks

1. Open board view (two columns: **Todo** | **Done**)
2. Tasks sorted by due date automatically
3. Click a task to jump to its source note for context
4. Mark task done on board → checkbox in source note becomes checked
5. Check checkbox in note → task moves to Done on board

### Reviewing a person/project

1. Click a label (e.g., `Greg`) anywhere in the UI
2. See all notes with that label (newest first)
3. See all tasks with that label (grouped by status)
4. Useful for: preparing for 1:1s, writing reviews, checking project status

### Quick standalone task

1. Create task directly on board (no source note)
2. Add labels manually via autocomplete
3. Optionally add due date

### Deleting a note with tasks

1. User deletes a note that has linked tasks
2. System prompts: "This note has X tasks. Delete them or keep as standalone?"
3. User chooses, action is performed

---

## Views

### Board View

- Two columns: **Todo** | **Done**
- Tasks sorted by due date (no due date = bottom)
- Each task card shows: title, labels, due date, link icon (if from a note)
- Click link icon to navigate to source note

### Label View

- Shows all notes and tasks with a given label
- Notes: newest first
- Tasks: grouped by status, sorted by due date

### Note List View

- All notes, newest first
- Shows: content preview, labels, task count
- Click to open note editor

---

## Key Behaviors

### Task extraction from notes

- Checkboxes in a note automatically create Task entities
- Task title = checkbox text
- Task inherits all labels from the parent note
- Task links back to the note

### Bidirectional sync

- **Board → Note**: Mark task done → checkbox becomes checked
- **Note → Board**: Check checkbox → task moves to Done
- **Edit task title**: Updates both the Task and the note content
- Sync happens on save

### Note updates and task diffing

When a note is saved:
- New checkboxes → create tasks
- Removed checkboxes → delete tasks
- Changed checkbox text → update task title
- Changed checkbox state → update task status

---

## MVP Scope

**Included:**
- Notes with rich text editor and checkboxes
- Tasks with board view (Todo/Done)
- Labels on notes and tasks
- Task extraction from notes with bidirectional sync
- Label view
- Due date sorting

**Out of Scope:**
- Multiple users / collaboration
- Mobile app
- Calendar integration
- Notifications / reminders
- Search
- Hierarchical labels
