import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LabelService } from '../../services/label.service';
import { TaskService } from '../../services/task.service';
import { LabelDetails } from '../../models/label.model';
import { Task } from '../../models/task.model';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-label-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-white">
      <!-- Header -->
      <header class="border-b border-gray-100">
        <div class="max-w-4xl mx-auto px-8 py-6">
          <div class="flex items-center gap-4">
            <button
              (click)="goBack()"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Go back"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            </button>
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                {{ labelDetails()?.name }}
              </span>
              <h1 class="text-xl font-semibold text-gray-900">Label View</h1>
            </div>
          </div>
        </div>
      </header>

      <!-- Loading State -->
      @if (loading()) {
        <div class="max-w-4xl mx-auto px-8 py-12 text-center text-gray-500">
          Loading...
        </div>
      } @else if (!labelDetails()) {
        <div class="max-w-4xl mx-auto px-8 py-12 text-center text-gray-500">
          Label not found
        </div>
      } @else {
        <!-- Content -->
        <main class="max-w-4xl mx-auto px-8 py-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Notes Section -->
            <section>
              <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Notes
                <span class="ml-2 text-gray-400">({{ labelDetails()!.notes.length }})</span>
              </h2>

              @if (labelDetails()!.notes.length === 0) {
                <div class="border border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-400 text-sm">
                  No notes with this label
                </div>
              } @else {
                <div class="space-y-2">
                  @for (note of labelDetails()!.notes; track note.id) {
                    <article
                      class="group flex items-start gap-4 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors border border-gray-100"
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
                        @if (getSnippet(note.content)) {
                          <p class="text-sm text-gray-500 mt-0.5 line-clamp-2">
                            {{ getSnippet(note.content) }}
                          </p>
                        }
                        <p class="text-xs text-gray-400 mt-1">
                          {{ formatDate(note.updatedAt) }}
                        </p>
                      </div>
                    </article>
                  }
                </div>
              }
            </section>

            <!-- Tasks Section -->
            <section>
              <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Tasks
                <span class="ml-2 text-gray-400">({{ labelDetails()!.tasks.length }})</span>
              </h2>

              @if (labelDetails()!.tasks.length === 0) {
                <div class="border border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-400 text-sm">
                  No tasks with this label
                </div>
              } @else {
                <!-- Todo Tasks -->
                @if (todoTasks().length > 0) {
                  <div class="mb-4">
                    <h3 class="text-xs font-medium text-gray-500 uppercase mb-2">Todo</h3>
                    <div class="space-y-2">
                      @for (task of todoTasks(); track task.id) {
                        <div class="group bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow transition-shadow relative">
                          <button
                            (click)="deleteTask(task)"
                            class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                            title="Delete task"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                          <div class="flex items-start gap-3">
                            <input
                              type="checkbox"
                              [checked]="false"
                              (change)="toggleTaskStatus(task)"
                              class="mt-0.5 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                            />
                            <div class="flex-1 min-w-0 pr-4">
                              <div class="flex items-center gap-1">
                                @if (task.noteId) {
                                  <button
                                    (click)="openNote(task.noteId!); $event.stopPropagation()"
                                    class="text-gray-400 hover:text-blue-600 flex-shrink-0 transition-colors"
                                    title="View source note"
                                  >
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                                    </svg>
                                  </button>
                                }
                                @if (editingTaskId() === task.id) {
                                  <input
                                    type="text"
                                    [value]="editingTitle()"
                                    (input)="onEditInput($event)"
                                    (keyup.enter)="saveEdit(task)"
                                    (keyup.escape)="cancelEdit()"
                                    (blur)="saveEdit(task)"
                                    class="w-full text-sm text-gray-900 border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:border-gray-500"
                                  />
                                } @else {
                                  <p
                                    class="text-sm text-gray-900 cursor-pointer hover:text-gray-600"
                                    (click)="startEdit(task)"
                                  >{{ task.title }}</p>
                                }
                              </div>
                              <div class="flex items-center gap-2 mt-1">
                                <p class="text-xs text-gray-400">
                                  {{ formatDate(task.createdAt) }}
                                </p>
                                @if (editingDueDateTaskId() === task.id) {
                                  <input
                                    type="date"
                                    [value]="task.dueDate ? task.dueDate.split('T')[0] : ''"
                                    (change)="onDueDateChange($event, task)"
                                    (blur)="cancelDueDateEdit()"
                                    class="text-xs border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:border-gray-500"
                                  />
                                  @if (task.dueDate) {
                                    <button
                                      (click)="clearDueDate(task); $event.stopPropagation()"
                                      class="text-xs text-red-500 hover:text-red-700"
                                    >Clear</button>
                                  }
                                } @else {
                                  <button
                                    (click)="startDueDateEdit(task)"
                                    class="text-xs px-1.5 py-0.5 rounded hover:bg-gray-100"
                                    [class.text-orange-600]="isDueSoon(task.dueDate)"
                                    [class.text-red-600]="isOverdue(task.dueDate)"
                                    [class.text-gray-400]="!task.dueDate"
                                  >
                                    {{ task.dueDate ? formatDueDate(task.dueDate) : 'Set due date' }}
                                  </button>
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- Done Tasks -->
                @if (doneTasks().length > 0) {
                  <div>
                    <h3 class="text-xs font-medium text-gray-500 uppercase mb-2">Done</h3>
                    <div class="space-y-2">
                      @for (task of doneTasks(); track task.id) {
                        <div class="group bg-white rounded-lg border border-gray-200 p-3 shadow-sm opacity-60 relative">
                          <button
                            (click)="deleteTask(task)"
                            class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                            title="Delete task"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                          <div class="flex items-start gap-3">
                            <input
                              type="checkbox"
                              [checked]="true"
                              (change)="toggleTaskStatus(task)"
                              class="mt-0.5 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                            />
                            <div class="flex-1 min-w-0 pr-4">
                              <div class="flex items-center gap-1">
                                @if (task.noteId) {
                                  <button
                                    (click)="openNote(task.noteId!); $event.stopPropagation()"
                                    class="text-gray-400 hover:text-blue-600 flex-shrink-0 transition-colors"
                                    title="View source note"
                                  >
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                                    </svg>
                                  </button>
                                }
                                @if (editingTaskId() === task.id) {
                                  <input
                                    type="text"
                                    [value]="editingTitle()"
                                    (input)="onEditInput($event)"
                                    (keyup.enter)="saveEdit(task)"
                                    (keyup.escape)="cancelEdit()"
                                    (blur)="saveEdit(task)"
                                    class="w-full text-sm text-gray-500 border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:border-gray-500"
                                  />
                                } @else {
                                  <p
                                    class="text-sm text-gray-500 line-through cursor-pointer hover:text-gray-400"
                                    (click)="startEdit(task)"
                                  >{{ task.title }}</p>
                                }
                              </div>
                              <p class="text-xs text-gray-400 mt-1">
                                {{ formatDate(task.completedAt!) }}
                              </p>
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              }
            </section>
          </div>
        </main>
      }
    </div>
  `
})
export class LabelViewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly labelService = inject(LabelService);
  private readonly taskService = inject(TaskService);

  labelDetails = signal<LabelDetails | null>(null);
  loading = signal(true);
  editingTaskId = signal<string | null>(null);
  editingTitle = signal('');
  editingDueDateTaskId = signal<string | null>(null);

  todoTasks = computed(() => {
    const details = this.labelDetails();
    if (!details) return [];
    return details.tasks
      .filter(t => t.status === 'todo')
      .sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  });

  doneTasks = computed(() => {
    const details = this.labelDetails();
    if (!details) return [];
    return details.tasks
      .filter(t => t.status === 'done')
      .sort((a, b) => {
        if (a.completedAt && b.completedAt) {
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
        }
        return 0;
      });
  });

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.loadLabel(id);
    }
    this.loading.set(false);
  }

  private async loadLabel(id: string): Promise<void> {
    try {
      const details = await this.labelService.getLabelDetails(id);
      this.labelDetails.set(details);
    } catch {
      this.labelDetails.set(null);
    }
  }

  goBack(): void {
    this.location.back();
  }

  openNote(noteId: string): void {
    this.router.navigate(['/notes', noteId]);
  }

  async toggleTaskStatus(task: Task): Promise<void> {
    const newStatus = task.status === 'todo' ? 'done' : 'todo';
    await this.taskService.updateTaskStatus(task.id, newStatus);
    await this.reloadLabel();
  }

  async deleteTask(task: Task): Promise<void> {
    await this.taskService.deleteTask(task.id);
    await this.reloadLabel();
  }

  startEdit(task: Task): void {
    this.editingTaskId.set(task.id);
    this.editingTitle.set(task.title);
  }

  onEditInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.editingTitle.set(input.value);
  }

  async saveEdit(task: Task): Promise<void> {
    const newTitle = this.editingTitle().trim();
    if (newTitle && newTitle !== task.title) {
      await this.taskService.updateTaskTitle(task.id, newTitle);
      await this.reloadLabel();
    }
    this.cancelEdit();
  }

  cancelEdit(): void {
    this.editingTaskId.set(null);
    this.editingTitle.set('');
  }

  startDueDateEdit(task: Task): void {
    this.editingDueDateTaskId.set(task.id);
  }

  cancelDueDateEdit(): void {
    this.editingDueDateTaskId.set(null);
  }

  async onDueDateChange(event: Event, task: Task): Promise<void> {
    const input = event.target as HTMLInputElement;
    const dateValue = input.value ? new Date(input.value + 'T00:00:00').toISOString() : null;
    await this.taskService.updateTaskDueDate(task.id, dateValue);
    await this.reloadLabel();
    this.cancelDueDateEdit();
  }

  async clearDueDate(task: Task): Promise<void> {
    await this.taskService.updateTaskDueDate(task.id, null);
    await this.reloadLabel();
    this.cancelDueDateEdit();
  }

  private async reloadLabel(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.loadLabel(id);
    }
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

  formatDueDate(dateStr: string | null): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateStr);
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Overdue (${date.toLocaleDateString([], { month: 'short', day: 'numeric' })})`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays < 7) return `Due in ${diffDays}d`;
    return `Due ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
  }

  isOverdue(dateStr: string | null): boolean {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateStr);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  }

  isDueSoon(dateStr: string | null): boolean {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateStr);
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 2;
  }
}
