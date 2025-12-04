import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { TiptapEditorDirective } from 'ngx-tiptap';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { NoteService } from '../../services/note.service';
import { LabelService } from '../../services/label.service';
import { Note } from '../../models/note.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, TiptapEditorDirective, ConfirmDialogComponent],
  template: `
    <div class="min-h-screen bg-white">
      <!-- Top Bar -->
      <header class="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div class="max-w-4xl mx-auto px-8 py-3 flex items-center justify-between">
          <!-- Back Button -->
          <button
            class="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm"
            (click)="goBack()"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Notes
          </button>

          <!-- Status & Actions -->
          <div class="flex items-center gap-4">
            @if (isSaving()) {
              <span class="text-xs text-gray-400 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
                Saving...
              </span>
            } @else if (lastSaved()) {
              <span class="text-xs text-gray-400 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                Saved
              </span>
            }

            <!-- Delete Button -->
            <button
              class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              (click)="confirmDelete()"
              title="Delete note"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <!-- Toolbar -->
      @if (editor) {
        <div class="sticky top-[49px] z-10 bg-white border-b border-gray-100">
          <div class="max-w-4xl mx-auto px-8 py-2 flex items-center gap-1">
            <button
              class="p-2 rounded hover:bg-gray-100 transition-colors"
              [class.bg-gray-100]="editor.isActive('bold')"
              (click)="editor.chain().focus().toggleBold().run()"
              title="Bold"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"></path>
                <path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"></path>
              </svg>
            </button>
            <button
              class="p-2 rounded hover:bg-gray-100 transition-colors"
              [class.bg-gray-100]="editor.isActive('italic')"
              (click)="editor.chain().focus().toggleItalic().run()"
              title="Italic"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <line x1="19" y1="4" x2="10" y2="4"></line>
                <line x1="14" y1="20" x2="5" y2="20"></line>
                <line x1="15" y1="4" x2="9" y2="20"></line>
              </svg>
            </button>
            <div class="w-px h-4 bg-gray-200 mx-1"></div>
            <button
              class="p-2 rounded hover:bg-gray-100 transition-colors"
              [class.bg-gray-100]="editor.isActive('heading', { level: 1 })"
              (click)="editor.chain().focus().toggleHeading({ level: 1 }).run()"
              title="Heading 1"
            >
              <span class="text-xs font-bold">H1</span>
            </button>
            <button
              class="p-2 rounded hover:bg-gray-100 transition-colors"
              [class.bg-gray-100]="editor.isActive('heading', { level: 2 })"
              (click)="editor.chain().focus().toggleHeading({ level: 2 }).run()"
              title="Heading 2"
            >
              <span class="text-xs font-bold">H2</span>
            </button>
            <div class="w-px h-4 bg-gray-200 mx-1"></div>
            <button
              class="p-2 rounded hover:bg-gray-100 transition-colors"
              [class.bg-gray-100]="editor.isActive('bulletList')"
              (click)="editor.chain().focus().toggleBulletList().run()"
              title="Bullet List"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <circle cx="3" cy="6" r="1" fill="currentColor"></circle>
                <circle cx="3" cy="12" r="1" fill="currentColor"></circle>
                <circle cx="3" cy="18" r="1" fill="currentColor"></circle>
              </svg>
            </button>
            <button
              class="p-2 rounded hover:bg-gray-100 transition-colors"
              [class.bg-gray-100]="editor.isActive('orderedList')"
              (click)="editor.chain().focus().toggleOrderedList().run()"
              title="Numbered List"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <line x1="10" y1="6" x2="21" y2="6"></line>
                <line x1="10" y1="12" x2="21" y2="12"></line>
                <line x1="10" y1="18" x2="21" y2="18"></line>
                <text x="3" y="8" font-size="8" fill="currentColor">1</text>
                <text x="3" y="14" font-size="8" fill="currentColor">2</text>
                <text x="3" y="20" font-size="8" fill="currentColor">3</text>
              </svg>
            </button>
            <div class="w-px h-4 bg-gray-200 mx-1"></div>
            <button
              class="p-2 rounded hover:bg-gray-100 transition-colors"
              [class.bg-gray-100]="editor.isActive('blockquote')"
              (click)="editor.chain().focus().toggleBlockquote().run()"
              title="Quote"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"></path>
                <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"></path>
              </svg>
            </button>
            <button
              class="p-2 rounded hover:bg-gray-100 transition-colors"
              [class.bg-gray-100]="editor.isActive('codeBlock')"
              (click)="editor.chain().focus().toggleCodeBlock().run()"
              title="Code Block"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            </button>
            <button
              class="p-2 rounded hover:bg-gray-100 transition-colors"
              [class.bg-gray-100]="editor.isActive('code')"
              (click)="editor.chain().focus().toggleCode().run()"
              title="Inline Code"
            >
              <span class="text-xs font-mono">&lt;/&gt;</span>
            </button>
          </div>
        </div>
      }

      <!-- Labels Section -->
      <div class="max-w-4xl mx-auto px-8 pt-6">
        <div class="flex items-center gap-2 flex-wrap">
          <!-- Existing Labels -->
          @for (label of note()?.labels || []; track label.id) {
            <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
              <button
                class="hover:underline"
                (click)="navigateToLabel(label.id)"
              >{{ label.name }}</button>
              <button
                class="hover:text-red-600 transition-colors"
                (click)="removeLabel(label.id)"
                title="Remove label"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </span>
          }

          <!-- Add Label Input -->
          <div class="relative">
            @if (showLabelInput()) {
              <div class="relative">
                <input
                  type="text"
                  [(ngModel)]="newLabelName"
                  (keyup.enter)="addLabel()"
                  (keyup.escape)="closeLabelInput()"
                  (input)="onLabelInputChange($event)"
                  placeholder="Add label..."
                  class="px-2.5 py-1 text-sm border border-gray-300 rounded-full focus:outline-none focus:border-gray-500 w-32"
                  #labelInput
                />
                @if (filteredLabels().length > 0) {
                  <div class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[150px]">
                    @for (label of filteredLabels(); track label.id) {
                      <button
                        class="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                        (click)="selectLabel(label.name)"
                      >
                        {{ label.name }}
                      </button>
                    }
                  </div>
                }
              </div>
            } @else {
              <button
                class="inline-flex items-center gap-1 px-2.5 py-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 text-sm rounded-full transition-colors"
                (click)="openLabelInput()"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Add label
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Editor Area -->
      <main class="max-w-4xl mx-auto px-8 py-8">
        @if (editor) {
          <tiptap-editor [editor]="editor" />
        }
      </main>
    </div>

    <!-- Delete Confirmation Dialog -->
    <app-confirm-dialog
      [isOpen]="showDeleteDialog()"
      title="Delete Note"
      message="Are you sure you want to delete this note? This action cannot be undone."
      confirmText="Delete"
      (confirm)="deleteNote()"
      (cancel)="cancelDelete()"
    />
  `,
  styles: [`
    :host ::ng-deep .tiptap {
      outline: none;
      min-height: 60vh;
      font-size: 16px;
      line-height: 1.7;
      color: #374151;
    }

    :host ::ng-deep .tiptap > *:first-child {
      margin-top: 0;
    }

    :host ::ng-deep .tiptap p {
      margin: 0 0 0.75em 0;
    }

    :host ::ng-deep .tiptap p:last-child {
      margin-bottom: 0;
    }

    :host ::ng-deep .tiptap p.is-editor-empty:first-child::before {
      color: #9ca3af;
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
    }

    :host ::ng-deep .tiptap h1 {
      font-size: 2em;
      font-weight: 700;
      color: #111827;
      margin: 1em 0 0.5em 0;
      line-height: 1.2;
    }

    :host ::ng-deep .tiptap h2 {
      font-size: 1.5em;
      font-weight: 600;
      color: #111827;
      margin: 1em 0 0.5em 0;
      line-height: 1.3;
    }

    :host ::ng-deep .tiptap h3 {
      font-size: 1.25em;
      font-weight: 600;
      color: #111827;
      margin: 1em 0 0.5em 0;
    }

    :host ::ng-deep .tiptap h1:first-child,
    :host ::ng-deep .tiptap h2:first-child,
    :host ::ng-deep .tiptap h3:first-child {
      margin-top: 0;
    }

    :host ::ng-deep .tiptap ul,
    :host ::ng-deep .tiptap ol {
      padding-left: 1.5em;
      margin: 0.5em 0;
    }

    :host ::ng-deep .tiptap li {
      margin: 0.25em 0;
    }

    :host ::ng-deep .tiptap li p {
      margin: 0;
    }

    :host ::ng-deep .tiptap blockquote {
      border-left: 3px solid #e5e7eb;
      padding-left: 1em;
      margin: 1em 0;
      color: #6b7280;
      font-style: italic;
    }

    :host ::ng-deep .tiptap hr {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 2em 0;
    }

    :host ::ng-deep .tiptap code {
      background: #f3f4f6;
      padding: 0.2em 0.4em;
      border-radius: 4px;
      font-size: 0.9em;
      font-family: ui-monospace, monospace;
    }

    :host ::ng-deep .tiptap pre {
      background: #1f2937;
      color: #f9fafb;
      padding: 1em;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1em 0;
      font-family: ui-monospace, monospace;
      font-size: 0.9em;
      line-height: 1.5;
    }

    :host ::ng-deep .tiptap pre code {
      background: none;
      padding: 0;
      color: inherit;
    }

    :host ::ng-deep .tiptap strong {
      font-weight: 600;
      color: #111827;
    }

    :host ::ng-deep .tiptap a {
      color: #2563eb;
      text-decoration: underline;
    }

    :host ::ng-deep .tiptap a:hover {
      color: #1d4ed8;
    }
  `]
})
export class NoteEditorComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly noteService = inject(NoteService);
  private readonly labelService = inject(LabelService);
  private readonly destroy$ = new Subject<void>();
  private readonly contentChange$ = new Subject<string>();

  editor!: Editor;
  note = signal<Note | null>(null);
  isSaving = signal(false);
  lastSaved = signal(false);
  showDeleteDialog = signal(false);
  showLabelInput = signal(false);
  newLabelName = '';
  labelSearchTerm = signal('');

  allLabels = this.labelService.labels;
  filteredLabels = computed(() => {
    const term = this.labelSearchTerm().toLowerCase().trim();
    if (!term) return [];
    const noteLabels = this.note()?.labels || [];
    const noteLabelIds = new Set(noteLabels.map(l => l.id));
    return this.allLabels()
      .filter(l => l.name.toLowerCase().includes(term) && !noteLabelIds.has(l.id))
      .slice(0, 5);
  });

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      await this.router.navigate(['/']);
      return;
    }

    // Load note and all labels in parallel
    const [note] = await Promise.all([
      this.noteService.getNote(id),
      this.labelService.loadLabels()
    ]);
    this.note.set(note);

    this.editor = new Editor({
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder: 'Start writing...'
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-blue-600 underline'
          }
        })
      ],
      content: note.content || '',
      editorProps: {
        attributes: {
          class: 'prose prose-gray max-w-none'
        }
      },
      onUpdate: ({ editor }) => {
        this.contentChange$.next(editor.getHTML());
      }
    });

    // Auto-save with 500ms debounce
    this.contentChange$
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe(content => this.saveNote(content));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.editor?.destroy();
  }

  async saveNote(content: string): Promise<void> {
    const currentNote = this.note();
    if (!currentNote) return;

    this.isSaving.set(true);
    this.lastSaved.set(false);

    try {
      const updated = await this.noteService.updateNote({
        id: currentNote.id,
        content
      });
      this.note.set(updated);
      this.lastSaved.set(true);
    } finally {
      this.isSaving.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  confirmDelete(): void {
    this.showDeleteDialog.set(true);
  }

  async deleteNote(): Promise<void> {
    const currentNote = this.note();
    if (currentNote) {
      await this.noteService.deleteNote(currentNote.id);
      this.router.navigate(['/']);
    }
    this.showDeleteDialog.set(false);
  }

  cancelDelete(): void {
    this.showDeleteDialog.set(false);
  }

  // Label methods
  openLabelInput(): void {
    this.showLabelInput.set(true);
    this.newLabelName = '';
    this.labelSearchTerm.set('');
  }

  closeLabelInput(): void {
    this.showLabelInput.set(false);
    this.newLabelName = '';
    this.labelSearchTerm.set('');
  }

  onLabelInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.labelSearchTerm.set(input.value);
  }

  async addLabel(): Promise<void> {
    const currentNote = this.note();
    if (!currentNote || !this.newLabelName.trim()) return;

    await this.labelService.addLabelToNote(currentNote.id, this.newLabelName.trim());
    // Refresh the note to get updated labels
    const updated = await this.noteService.getNote(currentNote.id);
    this.note.set(updated);
    this.closeLabelInput();
  }

  async selectLabel(name: string): Promise<void> {
    this.newLabelName = name;
    await this.addLabel();
  }

  async removeLabel(labelId: string): Promise<void> {
    const currentNote = this.note();
    if (!currentNote) return;

    await this.labelService.removeLabelFromNote(currentNote.id, labelId);
    // Update local state
    this.note.update(n => {
      if (!n) return n;
      return {
        ...n,
        labels: n.labels.filter(l => l.id !== labelId)
      };
    });
  }

  navigateToLabel(labelId: string): void {
    this.router.navigate(['/labels', labelId]);
  }
}
