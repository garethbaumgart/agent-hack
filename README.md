# MyNote

**A note-first task management system for busy professionals.**

MyNote solves a fundamental productivity problem: notes and tasks don't belong together. Notes are records of information—meeting summaries, ideas, context. Tasks are actionable items with deadlines and statuses. MyNote keeps them separate but intelligently connected.

---

## Key Features

### Rich Note Taking
Write notes with a distraction-free editor. Format with headings, bold, italic, bullet points, and code blocks. Notes auto-save as you type, so you never lose work.

### Instant Task Extraction
Add a checkbox in any note and it becomes a task on your board. No retyping, no copy-paste. Your meeting notes become your action items in seconds.

### Visual Task Board
Manage tasks across three columns: **Todo**, **In Progress**, and **Done**. Drag tasks between columns to update status. Tasks sort automatically—by due date in Todo, by start time in In Progress, by completion time in Done.

### Smart Due Dates
Set deadlines on any task. Due dates display intelligently: "Due today", "Due tomorrow", "Overdue by 2d". Urgent tasks highlight in orange and red so nothing slips through.

### Label-Based Organization
Tag notes and tasks with labels. Click any label to see everything related to it—all notes and tasks in one view. Perfect for preparing 1:1s ("show me everything about Greg") or project reviews ("what's happening with FileGateway?").

### Bidirectional Sync
Check off a task on the board and the checkbox in its source note updates automatically. Edit a task title and the note reflects the change. Notes and tasks stay in sync without extra effort.

### Flexible Views
Switch between **grid view** (cards with previews) and **list view** (compact rows grouped by date). Your preference is saved automatically.

### Powerful Filtering
Search notes by title. Filter by multiple labels. Combine search and filters to find exactly what you need.

### Context Preservation
Every task knows where it came from. Click the link icon on any task to jump to its source note. Never lose the "why" behind your action items.

---

## Why MyNote?

| Problem | Solution |
|---------|----------|
| Notes and tasks get mixed up | Separate concepts, linked intelligently |
| Lost context when executing tasks | Every task links to its source note |
| Hard to gather related items | Click a label to see everything |
| Meeting prep takes too long | Label view shows all notes + tasks for a person or project |
| Kanban boards get cluttered | Only actionable tasks go on the board—notes stay separate |
| Manual updates between systems | Bidirectional sync keeps everything current |

---

## Getting Started

### Prerequisites
- .NET 9 SDK
- Node.js 20+
- PostgreSQL 17 (or use Docker)

### Run with Docker
```bash
docker-compose up
```

### Run Locally
```bash
# Backend
cd src/MyNote.API
dotnet run

# Frontend (separate terminal)
cd src/MyNote.UI
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

---

## Built With

- **Backend**: .NET 9, Entity Framework Core, PostgreSQL
- **Frontend**: Angular 20, PrimeNG, Tailwind CSS
- **Editor**: TipTap (rich text with task lists)

---

## License

MIT
