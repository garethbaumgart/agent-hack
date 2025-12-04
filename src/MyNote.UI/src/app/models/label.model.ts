import { Note } from './note.model';
import { Task } from './task.model';

export interface Label {
  id: string;
  name: string;
  createdAt: string;
}

export interface LabelDetails {
  id: string;
  name: string;
  notes: Note[];
  tasks: Task[];
}
