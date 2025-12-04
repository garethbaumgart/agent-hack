export interface NoteLabel {
  id: string;
  name: string;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  labels: NoteLabel[];
}

export interface CreateNoteRequest {
  content: string;
}

export interface UpdateNoteRequest {
  id: string;
  content: string;
}
