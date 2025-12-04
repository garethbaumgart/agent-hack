# Notes

## US-01: Create a Note

**As an** engineering manager
**I want to** create a new note
**So that** I can capture meeting notes, thoughts, or reference information

### Acceptance Criteria

- [ ] User can create a new note from the Note List View
- [ ] Note opens in TipTap rich text editor
- [ ] Note auto-saves on typing (debounced)
- [ ] Note is saved with created_at timestamp
- [ ] New note appears at top of Note List View
- [ ] Editor has "Back to list" button

### Technical Notes
- Includes minimal Note List View (full list view in US-04)
- Empty notes are allowed
- PostgreSQL via Docker for development

---

## US-02: Edit a Note

**As an** engineering manager
**I want to** edit an existing note
**So that** I can update or correct information

### Acceptance Criteria

- [ ] User can click a note to open it in the editor
- [ ] Changes are saved (manual save or auto-save)
- [ ] updated_at timestamp is set on save

---

## US-03: Delete a Note

**As an** engineering manager
**I want to** delete a note I no longer need
**So that** I can keep my notes organized

### Acceptance Criteria

- [ ] User can delete a note from the Note List View or editor
- [ ] If note has linked tasks, user is prompted: "Delete tasks or keep as standalone?"
- [ ] Note is removed from the system

---

## US-04: View Note List

**As an** engineering manager
**I want to** see all my notes in a list
**So that** I can find and access them quickly

### Acceptance Criteria

- [ ] Notes displayed newest first (by updatedAt)
- [ ] Each note shows: title + content snippet preview
- [ ] Clicking a note opens it in the editor

### Technical Notes
- Labels deferred to future user story
- Task count deferred until tasks feature is implemented
- Title extracted from first line/heading of content
- Snippet shows 1-2 lines of additional content preview

---

## US-29: Toggle Grid and List View

**As an** engineering manager
**I want to** switch between grid and list views for my notes
**So that** I can choose the layout that best suits how I browse my notes

### Acceptance Criteria

- [ ] User can toggle between Grid View and List View
- [ ] Toggle control is located in the top-right of the Notes page (icon buttons)
- [ ] Grid View displays notes as cards in a responsive grid layout
- [ ] List View displays notes as rows in a compact list
- [ ] User's view preference is persisted (remembered on next visit)
- [ ] Default view is Grid View

### Grid View Details

- [ ] Notes displayed as cards in a multi-column grid
- [ ] Each card shows:
  - Title (first line/heading)
  - Content preview snippet (2-3 lines)
  - Labels (if any)
  - Last updated date
- [ ] Cards are responsive: fewer columns on mobile, more on desktop
- [ ] Cards have consistent height with content truncation

### List View Details

- [ ] Notes displayed as single-line rows
- [ ] Each row shows:
  - Document icon
  - Title
  - Last updated date
  - Actions menu (three-dot)
- [ ] Rows grouped by date (Today, Yesterday, Previous 7 days, etc.)
- [ ] Compact layout optimized for scanning many notes quickly

### Technical Notes

- Use PrimeNG DataView component with layout toggle
- Store view preference in localStorage
- Grid: CSS Grid or Flexbox with responsive breakpoints
- List: Table-like layout with consistent column widths
- Icons: Grid icon (⊞) and List icon (☰) for toggle buttons

---

## US-30: Search and Filter Notes

**As an** engineering manager
**I want to** search my notes by title and filter by label
**So that** I can quickly find specific notes without scrolling through everything

### Acceptance Criteria

- [ ] Search bar is prominently displayed at the top of the Notes page
- [ ] User can search notes by title (partial match, case-insensitive)
- [ ] Search results update as the user types (debounced)
- [ ] User can filter notes by one or more labels
- [ ] Search and label filters can be combined
- [ ] Clear button to reset search and filters
- [ ] Empty state shown when no results match

### Search Details

- [ ] Search input with search icon (magnifying glass)
- [ ] Placeholder text: "Search notes..."
- [ ] Searches note titles (not full content in MVP)
- [ ] Minimum 2 characters before search triggers
- [ ] Debounce delay of 300ms to avoid excessive API calls
- [ ] Search term highlighted in results (optional enhancement)

### Label Filter Details

- [ ] Label filter dropdown/chips next to or below search bar
- [ ] Shows all available labels
- [ ] User can select multiple labels (OR logic: notes with any selected label)
- [ ] Selected labels shown as chips that can be dismissed
- [ ] Label count shown next to each label option (e.g., "Work (5)")

### UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Search notes...                    [Grid] [List] [A-Z]  │
├─────────────────────────────────────────────────────────────┤
│  Labels: [Work ×] [1:1s ×]  [+ Add filter]                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Note cards or list...]                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Technical Notes

- Use PrimeNG InputText with icon for search
- Use PrimeNG MultiSelect or Chips for label filter
- Client-side filtering for MVP (API filtering for scale)
- Combine with existing sort (by updatedAt)
- Works in both Grid and List views
- GET /api/notes?search=term&labels=id1,id2 for API filtering

---

## US-31: Insert and Paste Images into Notes

**As an** engineering manager
**I want to** insert or paste images into my notes
**So that** I can include screenshots, diagrams, and visual references alongside my text

### Acceptance Criteria

- [ ] User can paste images from clipboard directly into the note editor
- [ ] User can drag and drop image files into the note editor
- [ ] User can insert images via a toolbar button (file picker)
- [ ] Supported image formats: PNG, JPG, JPEG, GIF, WebP
- [ ] Images are uploaded and stored (not embedded as base64)
- [ ] Images display inline within the note content
- [ ] Images can be resized within the editor
- [ ] Images are deleted from storage when removed from note or note is deleted

### Paste from Clipboard

- [ ] Ctrl+V / Cmd+V pastes image from clipboard at cursor position
- [ ] Works with screenshots (e.g., from snipping tool, screenshot utilities)
- [ ] Works with images copied from other applications
- [ ] Shows upload progress indicator while uploading

### Drag and Drop

- [ ] User can drag image files from file explorer into editor
- [ ] Drop zone visual feedback when dragging over editor
- [ ] Multiple images can be dropped at once
- [ ] Shows upload progress for each image

### Toolbar Insert

- [ ] Image icon button in editor toolbar
- [ ] Opens file picker dialog on click
- [ ] Allows selecting multiple images
- [ ] Images inserted at current cursor position

### Image Display

- [ ] Images displayed inline with text flow
- [ ] Images have max-width of 100% (responsive)
- [ ] Click image to select/focus
- [ ] Resize handles on selected images (corner drag)
- [ ] Alt text can be set for accessibility (optional)

### Technical Notes

- Use TipTap Image extension
- Store images in backend storage (local filesystem or cloud storage)
- API endpoint: POST /api/images for upload, returns image URL
- API endpoint: DELETE /api/images/:id for cleanup
- Image metadata stored in database (id, filename, size, note_id, created_at)
- Consider max file size limit (e.g., 10MB per image)
- Consider total storage quota per user (future enhancement)