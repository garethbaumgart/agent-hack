import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Task, CreateTaskRequest } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5275/api/tasks';

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

  async updateTaskStatus(id: string, status: 'todo' | 'done'): Promise<Task> {
    const task = await firstValueFrom(this.http.put<Task>(`${this.apiUrl}/${id}/status`, { status }));
    this.tasksSignal.update(tasks => tasks.map(t => t.id === id ? task : t));
    return task;
  }

  getTodoTasks(): Task[] {
    return this.tasksSignal().filter(t => t.status === 'todo');
  }

  getDoneTasks(): Task[] {
    return this.tasksSignal().filter(t => t.status === 'done');
  }
}
