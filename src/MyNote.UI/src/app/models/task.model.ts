export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'done';
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  noteId: string | null;
}

export interface CreateTaskRequest {
  title: string;
}
