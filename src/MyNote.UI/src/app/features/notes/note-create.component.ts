import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { NoteService } from '../../services/note.service';

@Component({
  selector: 'app-note-create',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule],
  template: `
    <div class="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <p-card class="w-full max-w-md">
        <ng-template #header>
          <div class="p-4">
            <h2 class="text-xl font-semibold m-0">Create Note</h2>
          </div>
        </ng-template>

        @if (createdNote()) {
          <div class="p-4 bg-green-100 rounded mb-4">
            <p class="text-green-800 m-0">Note created successfully!</p>
            <p class="text-sm text-green-600 m-0 mt-2">ID: {{ createdNote()?.id }}</p>
          </div>
        }

        <p-button
          label="Create Empty Note"
          (onClick)="createNote()"
          [loading]="isLoading()"
          class="w-full"
        />
      </p-card>
    </div>
  `
})
export class NoteCreateComponent {
  private readonly noteService = inject(NoteService);

  isLoading = signal(false);
  createdNote = signal<{ id: string } | null>(null);

  async createNote(): Promise<void> {
    this.isLoading.set(true);
    try {
      const note = await this.noteService.createNote({ content: '' });
      this.createdNote.set({ id: note.id });
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
