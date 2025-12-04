import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/notes/note-list.component').then(m => m.NoteListComponent)
  },
  {
    path: 'notes/:id',
    loadComponent: () =>
      import('./features/notes/note-editor.component').then(m => m.NoteEditorComponent)
  }
];
