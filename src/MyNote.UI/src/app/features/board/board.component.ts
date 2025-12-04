import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

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
                  <div class="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow transition-shadow cursor-pointer">
                    <p class="text-sm text-gray-900">{{ task.title }}</p>
                    <p class="text-xs text-gray-400 mt-2">
                      {{ formatDate(task.createdAt) }}
                    </p>
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
                  <div class="bg-white rounded-lg border border-gray-200 p-3 shadow-sm opacity-60">
                    <p class="text-sm text-gray-500 line-through">{{ task.title }}</p>
                    <p class="text-xs text-gray-400 mt-2">
                      {{ formatDate(task.completedAt!) }}
                    </p>
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

  newTaskTitle = signal('');

  todoTasks = () => this.taskService.getTodoTasks();
  doneTasks = () => this.taskService.getDoneTasks();

  async ngOnInit(): Promise<void> {
    await this.taskService.loadTasks();
  }

  async createTask(): Promise<void> {
    const title = this.newTaskTitle().trim();
    if (!title) return;

    await this.taskService.createTask({ title });
    this.newTaskTitle.set('');
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
