import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shared/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'notes',
        pathMatch: 'full'
      },
      {
        path: 'notes',
        loadComponent: () =>
          import('./features/notes/note-list.component').then(m => m.NoteListComponent)
      },
      {
        path: 'board',
        loadComponent: () =>
          import('./features/board/board.component').then(m => m.BoardComponent)
      }
    ]
  },
  {
    path: 'notes/:id',
    loadComponent: () =>
      import('./features/notes/note-editor.component').then(m => m.NoteEditorComponent)
  }
];
