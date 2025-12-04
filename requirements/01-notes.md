# Notes

## US-01: Create a Note

**As an** engineering manager
**I want to** create a new note
**So that** I can capture meeting notes, thoughts, or reference information

### Acceptance Criteria

- [ ] User can create a new note from the Note List View
- [ ] Note opens in a rich text editor
- [ ] Note is saved with created_at timestamp
- [ ] New note appears at top of Note List View

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

- [ ] Notes displayed newest first
- [ ] Each note shows: content preview, labels, task count
- [ ] Clicking a note opens it in the editor
