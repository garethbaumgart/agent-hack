import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50"
          (click)="onCancel()"
        ></div>

        <!-- Dialog -->
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ title }}</h3>
          <p class="text-gray-600 text-sm mb-6">{{ message }}</p>

          <div class="flex justify-end gap-3">
            <button
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              (click)="onCancel()"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              (click)="onConfirm()"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm';
  @Input() message = 'Are you sure?';
  @Input() confirmText = 'Delete';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
