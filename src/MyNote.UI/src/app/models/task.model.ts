export interface TaskLabel {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'done';
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  dueDate: string | null;
  noteId: string | null;
  labels: TaskLabel[];
}

export interface CreateTaskRequest {
  title: string;
}
