import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Label, LabelDetails } from '../models/label.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LabelService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/labels`;

  private labelsSignal = signal<Label[]>([]);
  labels = this.labelsSignal.asReadonly();

  async loadLabels(): Promise<void> {
    const labels = await firstValueFrom(this.http.get<Label[]>(this.apiUrl));
    this.labelsSignal.set(labels);
  }

  async addLabelToNote(noteId: string, name: string): Promise<Label> {
    const label = await firstValueFrom(
      this.http.post<Label>(`${this.apiUrl}/notes/${noteId}`, { name })
    );
    // Refresh labels list to include any new labels
    await this.loadLabels();
    return label;
  }

  async removeLabelFromNote(noteId: string, labelId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.apiUrl}/notes/${noteId}/${labelId}`)
    );
  }

  async addLabelToTask(taskId: string, name: string): Promise<Label> {
    const label = await firstValueFrom(
      this.http.post<Label>(`${this.apiUrl}/tasks/${taskId}`, { name })
    );
    await this.loadLabels();
    return label;
  }

  async removeLabelFromTask(taskId: string, labelId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.apiUrl}/tasks/${taskId}/${labelId}`)
    );
  }

  async getLabelDetails(labelId: string): Promise<LabelDetails> {
    return await firstValueFrom(
      this.http.get<LabelDetails>(`${this.apiUrl}/${labelId}`)
    );
  }
}
