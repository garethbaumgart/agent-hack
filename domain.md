# MyNote Domain

## Problem Statement

Managing daily work as a people manager involves tracking interactions across multiple people, projects, and meetings. Current tools (like Notion's Kanban boards) conflate notes and tasks, causing:
- Tasks stuck in "In Progress" forever (because they're actually notes, not tasks)
- Too many items to scan visually (~87+ items across columns)
- Lost context - tasks disconnected from where they originated
- No easy way to see "everything related to Greg" or "everything about Project X"

### Current Pain Points (from Notion usage)
- Kanban columns don't work well when mixing notes and tasks
- People cards (Greg, Sok, Matt T) sit in "In Progress" forever - they're not tasks, they're reference pages
- Projects, meetings, and action items all look the same on the board
- Hard to prepare for 1:1s - need to find all notes about a person scattered across the board

## Solution

A **note-first system** where:
- **Notes are the source of truth** - free-form, always labeled
- **Tasks are extracted automatically** - checkboxes in notes become tasks on a board
- **Labels connect everything** - click a label to see all related notes and tasks
- **Tasks link back to context** - every task knows where it came from

### The Key Insight
Notes and tasks are fundamentally different:
- **Notes** don't have a "status" - they're records of what happened
- **Tasks** have a lifecycle (to do → doing → done)

Mixing them in a single Kanban breaks both.

---

## Core Entities

### Note
A free-form text entry for capturing meeting notes, thoughts, or reference information.

| Property | Description |
|----------|-------------|
| id | UUID primary key |
| content | Free-form text with TipTap JSON (supports markdown and checkboxes) |
| labels | One or more labels (required, defaults to "unlabeled") |
| created_at | Timestamp when note was created |
| updated_at | Timestamp when note was last modified |

**Notes can be:**
- Meeting notes (tagged with person/meeting label)
- Project updates (tagged with project label)
- Pure reference/thoughts (no action items)
- Any combination of the above

### Task
An actionable item with a completion state. Can originate from a note or be standalone.

| Property | Description |
|----------|-------------|
| id | UUID primary key |
| title | The task description text |
| status | `not_started`, `in_progress`, `done` |
| due_date | Optional date (no time component) |
| note_id | Link to source note (null for standalone tasks) |
| next_task_id | Link to next task in priority order (linked list) |
| completed_at | Timestamp when marked done (null if not done) |
| created_at | Timestamp when task was created |
| updated_at | Timestamp when task was last modified |

**Task ordering:**
- Active tasks (not_started, in_progress) are ordered via linked list (`next_task_id`)
- Done tasks are ordered by `completed_at` (most recently completed first)
- Drag to reorder updates the linked list pointers

### Label
A tag that connects related notes and tasks.

| Property | Description |
|----------|-------------|
| id | UUID primary key |
| name | The label text (e.g., "Greg", "FileGateway", "Leadership Sync") |

**Label behavior:**
- Flat (no hierarchy)
- Created on-the-fly via autocomplete when typing
- If no match exists, typing creates a new label
- Shared across notes and tasks
- Labels with no references could be garbage collected (or kept for autocomplete)

---

## User Workflows

### Taking meeting notes
1. Create a new note
2. Add labels (e.g., `Greg`, `1:1`) via autocomplete
3. Write free-form notes in Notion-like editor (TipTap)
4. Add checkboxes for action items:
   ```
   Discussed promotion timeline. Feeling good about Q1.
   - [ ] Send promotion criteria doc
   - [ ] Follow up on AWS cert progress
   ```
5. On save, checkboxes automatically appear as tasks on the board
6. Tasks inherit all labels from the parent note

### Working through tasks
1. Open board view (grouped by status: Not started | In progress | Done)
2. Drag tasks to reorder by priority (within a column)
3. Optionally sort view by due date
4. Click a task to jump to its source note for context
5. Complete task on board → moves to Done column AND checks off in source note
6. Complete checkbox in note → task moves to Done on board

### Reviewing a person/project
1. Click a label (e.g., `Greg`) anywhere in the UI
2. See all notes tagged with that label (newest first)
3. See all tasks tagged with that label
4. Single unified view - useful for:
   - Preparing for 1:1s
   - Writing performance reviews
   - Checking project status

### Quick standalone task
1. Create task directly on board (no source note)
2. Add labels manually via autocomplete
3. Set priority by dragging position
4. Optionally add due date

### Deleting a note with tasks
1. User clicks delete on a note that has linked tasks
2. System prompts: "This note has X tasks. What would you like to do?"
   - **Delete tasks** - tasks are removed with the note
   - **Keep tasks** - tasks become standalone (note_id set to null)
3. User chooses, action is performed

---

## Views

### Board View (Primary)
- Tasks grouped by status columns: **Not started** | **In progress** | **Done**
- Drag to reorder within columns (manual priority via linked list)
- Sort options: manual order (default), due date
- Each task card shows:
  - Title
  - Labels (as chips/tags)
  - Due date (if set)
  - Link icon (if from a note - clickable to navigate)
- Done column can be collapsed/filtered

### Label View
- Triggered by clicking any label
- Shows in a single unified view:
  - All notes with that label (newest first)
  - All tasks with that label (grouped by status)
- Useful for seeing everything related to a person/project

### Note List View
- All notes, newest first
- Each note shows: preview of content, labels, task count
- Click to open note editor

---

## Key Behaviors

### Task extraction from notes
- TipTap editor with task list extension
- Any checkbox (`- [ ]`) in a note automatically creates a Task entity
- Task title = checkbox text content
- Task inherits all labels from the parent note
- Task links back to the note via `note_id`
- Task gets a unique identifier stored in the TipTap JSON (for sync)

### Bidirectional sync
- **Board → Note**: When task status changes to "done" on board, checkbox in source note becomes checked
- **Note → Board**: When checkbox is checked in note editor, task status changes to "done"
- **Edit task title**: Updates both the Task entity and the TipTap content
- Sync happens on save (not real-time keystroke)

### Note updates and task diffing
On note save:
1. Parse TipTap content for all checkboxes
2. Compare against existing tasks linked to this note
3. **New checkboxes** → Create new Task entities
4. **Removed checkboxes** → Delete the linked Task (or orphan? TBD - probably delete)
5. **Changed checkbox text** → Update Task title
6. **Changed checkbox state** → Update Task status

### Completed tasks
- Move to "Done" column on board
- Checkbox shows as checked (`[x]`) in source note
- Remain visible in Done column (can collapse/filter)
- Ordered by `completed_at` (most recent first)
- Linked list pointers updated to bypass completed task

### Priority ordering (linked list)
- Each active task has `next_task_id` pointing to the next task in priority order
- First task in list has no pointer TO it (it's the head)
- Last task has `next_task_id = null`
- **Insert**: Find position, update surrounding pointers
- **Reorder (drag)**: Remove from current position (update prev→next), insert at new position
- **Complete**: Previous task's `next_task_id` updates to skip the completed task

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Note editor | TipTap | Notion-like block editor, good Angular support, extensible |
| Task ordering | Linked list | Efficient reordering without updating every task's position |
| Done task ordering | completed_at timestamp | Simple, no linked list maintenance needed |
| Note deletion | User prompt | Gives control - delete tasks or keep them standalone |
| MVP scope | Notes + Tasks only | Labels deferred to keep initial build focused |

---

## MVP Scope (Phase 1)

**Included:**
- Notes with TipTap editor
- Tasks with board view
- Task extraction from notes
- Bidirectional sync
- Basic CRUD for notes and tasks

**Deferred (Phase 2+):**
- Labels (full implementation)
- Label view
- Label autocomplete
- Mobile app
- Calendar integration / meeting prompts
- Due date reminders / notifications
- Sharing / collaboration
- Search across all notes

---

## Out of Scope (for foreseeable future)
- Mobile app (desktop-focused at work)
- Hierarchical labels
- Real-time collaboration
- Integrations with calendar/email
