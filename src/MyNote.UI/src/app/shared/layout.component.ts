import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="flex h-screen bg-gray-50">
      <!-- Sidebar -->
      <aside
        class="bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out"
        [class.w-64]="!collapsed()"
        [class.w-16]="collapsed()"
      >
        <!-- Logo & Toggle -->
        <div class="p-4 border-b border-gray-100 flex items-center" [class.justify-center]="collapsed()" [class.justify-between]="!collapsed()">
          @if (!collapsed()) {
            <h1 class="text-xl font-semibold text-gray-900">MyNote</h1>
          }
          <button
            (click)="toggleSidebar()"
            class="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            [attr.title]="collapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
          >
            <svg class="w-5 h-5 transition-transform duration-300" [class.rotate-180]="collapsed()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
            </svg>
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-2 space-y-1">
          <a
            routerLink="/notes"
            routerLinkActive="bg-gray-100 text-gray-900"
            [routerLinkActiveOptions]="{ exact: false }"
            class="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
            [class.justify-center]="collapsed()"
            [attr.title]="collapsed() ? 'Notes' : null"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            @if (!collapsed()) {
              <span>Notes</span>
            }
          </a>
          <a
            routerLink="/board"
            routerLinkActive="bg-gray-100 text-gray-900"
            class="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
            [class.justify-center]="collapsed()"
            [attr.title]="collapsed() ? 'Board' : null"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
            @if (!collapsed()) {
              <span>Board</span>
            }
          </a>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-auto">
        <router-outlet />
      </main>
    </div>
  `
})
export class LayoutComponent implements OnInit {
  private readonly STORAGE_KEY = 'sidebar-collapsed';
  collapsed = signal(false);

  ngOnInit(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored !== null) {
      this.collapsed.set(stored === 'true');
    }
  }

  toggleSidebar(): void {
    this.collapsed.update(v => !v);
    localStorage.setItem(this.STORAGE_KEY, String(this.collapsed()));
  }
}
