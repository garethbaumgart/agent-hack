import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NoteService } from '../../services/note.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { Note } from '../../models/note.model';

type ViewMode = 'grid' | 'list';

@Component({
  selector: 'app-note-list',
  standalone: true,
  imports: [CommonModule, ConfirmDialogComponent],
  template: `
    <div class="min-h-screen bg-white">
      <!-- Header -->
      <header class="border-b border-gray-100">
        <div class="max-w-5xl mx-auto px-8 py-6">
          <div class="flex items-center justify-between">
            <h1 class="text-2xl font-semibold text-gray-900">Notes</h1>
            <div class="flex items-center gap-3">
              <!-- View Toggle -->
              <div class="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  class="p-2 rounded-md transition-colors"
                  [class.bg-white]="viewMode() === 'grid'"
                  [class.shadow-sm]="viewMode() === 'grid'"
                  [class.text-gray-900]="viewMode() === 'grid'"
                  [class.text-gray-500]="viewMode() !== 'grid'"
                  (click)="setViewMode('grid')"
                  title="Grid view"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                  </svg>
                </button>
                <button
                  class="p-2 rounded-md transition-colors"
                  [class.bg-white]="viewMode() === 'list'"
                  [class.shadow-sm]="viewMode() === 'list'"
                  [class.text-gray-900]="viewMode() === 'list'"
                  [class.text-gray-500]="viewMode() !== 'list'"
                  (click)="setViewMode('list')"
                  title="List view"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                </button>
              </div>
              <button
                class="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                (click)="createNote()"
              >
                New Note
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="max-w-5xl mx-auto px-8 py-6">
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
          <!-- Grid View -->
          @if (viewMode() === 'grid') {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (note of noteService.notes(); track note.id) {
                <article
                  class="group relative flex flex-col p-4 rounded-lg cursor-pointer bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all h-48"
                  (click)="openNote(note.id)"
                >
                  <!-- Title -->
                  <h3 class="text-sm font-medium text-gray-900 truncate pr-8">
                    {{ getTitle(note.content) }}
                  </h3>

                  <!-- Content Preview -->
                  <p class="text-sm text-gray-500 mt-2 flex-1 line-clamp-3 overflow-hidden">
                    {{ getSnippet(note.content) || 'No content' }}
                  </p>

                  <!-- Labels -->
                  @if (note.labels && note.labels.length > 0) {
                    <div class="flex flex-wrap gap-1 mt-2">
                      @for (label of note.labels.slice(0, 3); track label.id) {
                        <span class="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                          {{ label.name }}
                        </span>
                      }
                      @if (note.labels.length > 3) {
                        <span class="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">
                          +{{ note.labels.length - 3 }}
                        </span>
                      }
                    </div>
                  }

                  <!-- Footer with Date -->
                  <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <p class="text-xs text-gray-400">
                      {{ formatDate(note.updatedAt) }}
                    </p>
                  </div>

                  <!-- Delete Button (absolute positioned) -->
                  <button
                    class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
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

          <!-- List View -->
          @if (viewMode() === 'list') {
            <div class="space-y-1">
              @for (group of groupedNotes(); track group.label) {
                <div class="mb-4">
                  <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-2">
                    {{ group.label }}
                  </h3>
                  @for (note of group.notes; track note.id) {
                    <article
                      class="group flex items-center gap-4 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      (click)="openNote(note.id)"
                    >
                      <!-- Icon -->
                      <div class="w-8 h-8 rounded-md flex items-center justify-center bg-gray-100 flex-shrink-0">
                        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                      </div>

                      <!-- Title -->
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">
                          {{ getTitle(note.content) }}
                        </p>
                      </div>

                      <!-- Date -->
                      <p class="text-xs text-gray-400 flex-shrink-0">
                        {{ formatDate(note.updatedAt) }}
                      </p>

                      <!-- Actions Menu -->
                      <button
                        class="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all flex-shrink-0"
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
            </div>
          }
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

  private readonly VIEW_MODE_KEY = 'notes-view-mode';

  showDeleteDialog = signal(false);
  noteToDelete = signal<string | null>(null);
  viewMode = signal<ViewMode>(this.loadViewMode());

  // Group notes by date for list view
  groupedNotes = computed(() => {
    const notes = this.noteService.notes();
    const groups: { label: string; notes: Note[] }[] = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const todayNotes: Note[] = [];
    const yesterdayNotes: Note[] = [];
    const lastWeekNotes: Note[] = [];
    const olderNotes: Note[] = [];

    for (const note of notes) {
      const noteDate = new Date(note.updatedAt);
      const noteDateOnly = new Date(noteDate.getFullYear(), noteDate.getMonth(), noteDate.getDate());

      if (noteDateOnly.getTime() >= today.getTime()) {
        todayNotes.push(note);
      } else if (noteDateOnly.getTime() >= yesterday.getTime()) {
        yesterdayNotes.push(note);
      } else if (noteDateOnly.getTime() >= lastWeek.getTime()) {
        lastWeekNotes.push(note);
      } else {
        olderNotes.push(note);
      }
    }

    if (todayNotes.length > 0) groups.push({ label: 'Today', notes: todayNotes });
    if (yesterdayNotes.length > 0) groups.push({ label: 'Yesterday', notes: yesterdayNotes });
    if (lastWeekNotes.length > 0) groups.push({ label: 'Previous 7 days', notes: lastWeekNotes });
    if (olderNotes.length > 0) groups.push({ label: 'Older', notes: olderNotes });

    return groups;
  });

  async ngOnInit(): Promise<void> {
    await this.noteService.loadNotes();
  }

  private loadViewMode(): ViewMode {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(this.VIEW_MODE_KEY);
      if (saved === 'list' || saved === 'grid') {
        return saved;
      }
    }
    return 'grid'; // Default to grid view
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.VIEW_MODE_KEY, mode);
    }
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
    const firstLine = text.split(/[.\n]/)[0];
    return firstLine.substring(0, 60) || 'Untitled';
  }

  getSnippet(content: string): string {
    if (!content) return '';
    const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!text) return '';
    const title = this.getTitle(content);
    const remaining = text.substring(title.length).trim();
    return remaining.substring(0, 120);
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
