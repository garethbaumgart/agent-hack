import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { LabelService } from '../../services/label.service';
import { type Task } from '../../models/task.model';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full bg-gray-50">
      <!-- Header -->
      <header class="bg-white border-b border-gray-200">
        <div class="px-8 py-6">
          <h1 class="text-2xl font-semibold text-gray-900">Board</h1>
        </div>
      </header>

      <!-- Board Content -->
      <div class="p-8">
        <div class="flex gap-6">
          <!-- Todo Column -->
          <div class="w-80 flex-shrink-0">
            <div class="bg-gray-100 rounded-lg p-4">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Todo
                  <span class="ml-2 text-gray-400">({{ todoTasks().length }})</span>
                </h2>
              </div>

              <!-- Add Task Input -->
              <div class="mb-4">
                <div class="bg-white rounded-lg border border-gray-200 p-3">
                  <input
                    type="text"
                    [(ngModel)]="newTaskTitle"
                    (keyup.enter)="createTask()"
                    placeholder="Add a task..."
                    class="w-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                  />
                  @if (newTaskTitle().trim()) {
                    <div class="flex justify-end mt-2">
                      <button
                        (click)="createTask()"
                        class="px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded hover:bg-gray-800 transition-colors"
                      >
                        Add Task
                      </button>
                    </div>
                  }
                </div>
              </div>

              <!-- Task Cards -->
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
                              (click)="navigateToNote(task.noteId!); $event.stopPropagation()"
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
                              #editInput
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
                        <!-- Labels -->
                        <div class="flex flex-wrap items-center gap-1 mt-2">
                          @for (label of task.labels; track label.id) {
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                              {{ label.name }}
                              <button
                                (click)="removeTaskLabel(task, label.id); $event.stopPropagation()"
                                class="hover:text-blue-900"
                              >×</button>
                            </span>
                          }
                          @if (editingLabelTaskId() === task.id) {
                            <div class="relative">
                              <input
                                type="text"
                                [(ngModel)]="labelSearchTerm"
                                (keyup.enter)="addTaskLabel(task)"
                                (keyup.escape)="cancelLabelEdit()"
                                placeholder="Label name"
                                class="w-24 text-xs border border-gray-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-gray-500"
                              />
                              @if (filteredLabels().length > 0) {
                                <div class="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 rounded shadow-lg z-10">
                                  @for (label of filteredLabels(); track label.id) {
                                    <button
                                      (click)="selectTaskLabel(task, label.name)"
                                      class="w-full text-left px-2 py-1 text-xs hover:bg-gray-100"
                                    >{{ label.name }}</button>
                                  }
                                </div>
                              }
                            </div>
                          } @else {
                            <button
                              (click)="startLabelEdit(task)"
                              class="text-xs text-gray-400 hover:text-gray-600 px-1"
                            >+ Label</button>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>

              @if (todoTasks().length === 0 && !newTaskTitle().trim()) {
                <div class="text-center py-8 text-gray-400 text-sm">
                  No tasks yet
                </div>
              }
            </div>
          </div>

          <!-- Done Column (for future US-06) -->
          <div class="w-80 flex-shrink-0">
            <div class="bg-gray-100 rounded-lg p-4">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Done
                  <span class="ml-2 text-gray-400">({{ doneTasks().length }})</span>
                </h2>
              </div>

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
                              (click)="navigateToNote(task.noteId!); $event.stopPropagation()"
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

              @if (doneTasks().length === 0) {
                <div class="text-center py-8 text-gray-400 text-sm">
                  No completed tasks
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BoardComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly labelService = inject(LabelService);
  private readonly router = inject(Router);

  newTaskTitle = signal('');
  editingTaskId = signal<string | null>(null);
  editingTitle = signal('');
  editingDueDateTaskId = signal<string | null>(null);
  editingLabelTaskId = signal<string | null>(null);
  labelSearchTerm = signal('');

  todoTasks = () => this.taskService.getTodoTasks();
  doneTasks = () => this.taskService.getDoneTasks();

  filteredLabels = computed(() => {
    const searchTerm = this.labelSearchTerm().toLowerCase();
    if (!searchTerm) return [];
    return this.labelService.labels().filter(l =>
      l.name.toLowerCase().includes(searchTerm)
    );
  });

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.taskService.loadTasks(),
      this.labelService.loadLabels()
    ]);
  }

  async createTask(): Promise<void> {
    const title = this.newTaskTitle().trim();
    if (!title) return;

    await this.taskService.createTask({ title });
    this.newTaskTitle.set('');
  }

  async toggleTaskStatus(task: Task): Promise<void> {
    const newStatus = task.status === 'todo' ? 'done' : 'todo';
    await this.taskService.updateTaskStatus(task.id, newStatus);
  }

  async deleteTask(task: Task): Promise<void> {
    await this.taskService.deleteTask(task.id);
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
    }
    this.cancelEdit();
  }

  cancelEdit(): void {
    this.editingTaskId.set(null);
    this.editingTitle.set('');
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
    this.cancelDueDateEdit();
  }

  async clearDueDate(task: Task): Promise<void> {
    await this.taskService.updateTaskDueDate(task.id, null);
    this.cancelDueDateEdit();
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

  startLabelEdit(task: Task): void {
    this.editingLabelTaskId.set(task.id);
    this.labelSearchTerm.set('');
  }

  cancelLabelEdit(): void {
    this.editingLabelTaskId.set(null);
    this.labelSearchTerm.set('');
  }

  async addTaskLabel(task: Task): Promise<void> {
    const name = this.labelSearchTerm().trim();
    if (!name) return;
    await this.labelService.addLabelToTask(task.id, name);
    await this.taskService.loadTasks();
    this.cancelLabelEdit();
  }

  async selectTaskLabel(task: Task, labelName: string): Promise<void> {
    await this.labelService.addLabelToTask(task.id, labelName);
    await this.taskService.loadTasks();
    this.cancelLabelEdit();
  }

  async removeTaskLabel(task: Task, labelId: string): Promise<void> {
    await this.labelService.removeLabelFromTask(task.id, labelId);
    await this.taskService.loadTasks();
  }

  navigateToNote(noteId: string): void {
    this.router.navigate(['/notes', noteId]);
  }
}
