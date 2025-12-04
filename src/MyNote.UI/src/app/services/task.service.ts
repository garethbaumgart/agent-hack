import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Task, CreateTaskRequest, UpdateTaskStatusResult, UpdateTaskDueDateResult } from '../models/task.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/tasks`;

  private tasksSignal = signal<Task[]>([]);
  tasks = this.tasksSignal.asReadonly();

  async loadTasks(): Promise<void> {
    const tasks = await firstValueFrom(this.http.get<Task[]>(this.apiUrl));
    this.tasksSignal.set(tasks);
  }

  async createTask(request: CreateTaskRequest): Promise<Task> {
    const task = await firstValueFrom(this.http.post<Task>(this.apiUrl, request));
    this.tasksSignal.update(tasks => [task, ...tasks]);
    return task;
  }

  async updateTaskStatus(id: string, status: 'todo' | 'done'): Promise<UpdateTaskStatusResult> {
    const result = await firstValueFrom(this.http.put<UpdateTaskStatusResult>(`${this.apiUrl}/${id}/status`, { status }));
    this.tasksSignal.update(tasks => tasks.map(t => t.id === id ? result.task : t));
    return result;
  }

  async updateTaskTitle(id: string, title: string): Promise<Task> {
    const task = await firstValueFrom(this.http.put<Task>(`${this.apiUrl}/${id}`, { title }));
    this.tasksSignal.update(tasks => tasks.map(t => t.id === id ? task : t));
    return task;
  }

  async updateTaskDueDate(id: string, dueDate: string | null): Promise<UpdateTaskDueDateResult> {
    const result = await firstValueFrom(this.http.put<UpdateTaskDueDateResult>(`${this.apiUrl}/${id}/due-date`, { dueDate }));
    this.tasksSignal.update(tasks => tasks.map(t => t.id === id ? result.task : t));
    return result;
  }

  async deleteTask(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
    this.tasksSignal.update(tasks => tasks.filter(t => t.id !== id));
  }

  getTodoTasks(): Task[] {
    return this.tasksSignal()
      .filter(t => t.status === 'todo')
      .sort((a, b) => {
        // Tasks with due dates come first, sorted by due date
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        // Tasks without due dates sorted by creation date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  getDoneTasks(): Task[] {
    return this.tasksSignal()
      .filter(t => t.status === 'done')
      .sort((a, b) => {
        // Sort by completed_at (most recent first)
        if (a.completedAt && b.completedAt) {
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
        }
        if (a.completedAt) return -1;
        if (b.completedAt) return 1;
        return 0;
      });
  }
}
