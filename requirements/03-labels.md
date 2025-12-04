# Labels

## US-11: Add Labels to a Note

**As an** engineering manager
**I want to** add labels to a note
**So that** I can organize and find related notes later

### Acceptance Criteria

- [ ] User can add one or more labels when creating or editing a note
- [ ] Autocomplete suggests existing labels as user types
- [ ] Typing a new name creates a new label
- [ ] Labels are displayed on the note

---

## US-12: Add Labels to a Standalone Task

**As an** engineering manager
**I want to** add labels to a standalone task
**So that** I can organize tasks by person or project

### Acceptance Criteria

- [ ] User can add labels when creating a standalone task
- [ ] User can add/remove labels on an existing standalone task
- [ ] Autocomplete suggests existing labels

---

## US-13: Remove Label from Note or Task

**As an** engineering manager
**I want to** remove a label from a note or task
**So that** I can correct mislabeled items

### Acceptance Criteria

- [ ] User can remove any label from a note
- [ ] User can remove any label from a standalone task
- [ ] Removing a label from a note does NOT automatically remove it from linked tasks

---

## US-14: Inherit Labels from Note to Task

**As an** engineering manager
**I want** tasks extracted from notes to inherit the note's labels
**So that** I don't have to manually label each task

### Acceptance Criteria

- [ ] When a task is created from a note checkbox, it gets all the note's current labels
- [ ] If labels are added to a note after tasks exist, existing tasks are NOT updated (labels inherited at creation time only)
