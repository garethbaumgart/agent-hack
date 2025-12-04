import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Note, CreateNoteRequest } from '../models/note.model';

@Injectable({ providedIn: 'root' })
export class NoteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5275/api/notes';

  async createNote(request: CreateNoteRequest): Promise<Note> {
    return firstValueFrom(this.http.post<Note>(this.apiUrl, request));
  }
}
