import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Note, CreateNoteRequest, UpdateNoteRequest } from '../models/note.model';

@Injectable({ providedIn: 'root' })
export class NoteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5275/api/notes';

  private notesSignal = signal<Note[]>([]);
  notes = this.notesSignal.asReadonly();

  async loadNotes(): Promise<void> {
    const notes = await firstValueFrom(this.http.get<Note[]>(this.apiUrl));
    this.notesSignal.set(notes);
  }

  async getNote(id: string): Promise<Note> {
    return firstValueFrom(this.http.get<Note>(`${this.apiUrl}/${id}`));
  }

  async createNote(request: CreateNoteRequest): Promise<Note> {
    const note = await firstValueFrom(this.http.post<Note>(this.apiUrl, request));
    this.notesSignal.update(notes => [note, ...notes]);
    return note;
  }

  async updateNote(request: UpdateNoteRequest): Promise<Note> {
    const note = await firstValueFrom(this.http.put<Note>(`${this.apiUrl}/${request.id}`, request));
    this.notesSignal.update(notes => notes.map(n => n.id === note.id ? note : n));
    return note;
  }
}
