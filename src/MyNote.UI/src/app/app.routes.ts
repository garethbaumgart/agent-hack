import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/notes/note-create.component').then(m => m.NoteCreateComponent)
  }
];
