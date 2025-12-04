import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NoteService } from '../../services/note.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

@Component({
  selector: 'app-note-list',
  standalone: true,
  imports: [CommonModule, ConfirmDialogComponent],
  template: `
    <div class="min-h-screen bg-white">
      <!-- Header -->
      <header class="border-b border-gray-100">
        <div class="max-w-4xl mx-auto px-8 py-6">
          <div class="flex items-center justify-between">
            <h1 class="text-2xl font-semibold text-gray-900">Notes</h1>
            <button
              class="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              (click)="createNote()"
            >
              New Note
            </button>
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="max-w-4xl mx-auto px-8 py-6">
        @if (noteService.notes().length === 0) {
          <!-- Empty State -->
          <div
            class="border border-dashed border-gray-200 rounded-lg p-12 text-center cursor-pointer hover:border-gray-300 hover:bg-gray-50/50 transition-all"
            (click)="createNote()"
          >
            <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </div>
            <p class="text-gray-500 text-sm">Create your first note</p>
          </div>
        } @else {
          <!-- Notes List -->
          <div class="space-y-2">
            @for (note of noteService.notes(); track note.id) {
              <article
                class="group flex items-start gap-4 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                (click)="openNote(note.id)"
              >
                <!-- Icon -->
                <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 flex-shrink-0">
                  <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ getTitle(note.content) }}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">
                    {{ formatDate(note.updatedAt) }}
                  </p>
                </div>

                <!-- Delete Button -->
                <button
                  class="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  (click)="confirmDelete($event, note.id)"
                  title="Delete note"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </article>
            }
          </div>
        }
      </main>
    </div>

    <!-- Delete Confirmation Dialog -->
    <app-confirm-dialog
      [isOpen]="showDeleteDialog()"
      title="Delete Note"
      message="Are you sure you want to delete this note? This action cannot be undone."
      confirmText="Delete"
      (confirm)="deleteNote()"
      (cancel)="cancelDelete()"
    />
  `
})
export class NoteListComponent implements OnInit {
  readonly noteService = inject(NoteService);
  private readonly router = inject(Router);

  showDeleteDialog = signal(false);
  noteToDelete = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.noteService.loadNotes();
  }

  async createNote(): Promise<void> {
    const note = await this.noteService.createNote({ content: '' });
    await this.router.navigate(['/notes', note.id]);
  }

  openNote(id: string): void {
    this.router.navigate(['/notes', id]);
  }

  confirmDelete(event: Event, id: string): void {
    event.stopPropagation();
    this.noteToDelete.set(id);
    this.showDeleteDialog.set(true);
  }

  async deleteNote(): Promise<void> {
    const id = this.noteToDelete();
    if (id) {
      await this.noteService.deleteNote(id);
    }
    this.showDeleteDialog.set(false);
    this.noteToDelete.set(null);
  }

  cancelDelete(): void {
    this.showDeleteDialog.set(false);
    this.noteToDelete.set(null);
  }

  getTitle(content: string): string {
    if (!content) return 'Untitled';
    const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!text) return 'Untitled';
    return text.substring(0, 60) || 'Untitled';
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}
