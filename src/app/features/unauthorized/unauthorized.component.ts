// features/unauthorized/unauthorized.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4">
      <div class="max-w-md w-full text-center">
        <div class="w-24 h-24 mx-auto bg-gradient-to-br from-red-400 to-red-500 rounded-2xl flex items-center justify-center shadow-xl shadow-red-200">
          <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mt-6">Access Denied</h1>
        <p class="text-gray-600 mt-2">You don't have permission to access this page.</p>
        <a routerLink="/dashboard" class="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all">
          Go to Dashboard
        </a>
      </div>
    </div>
  `
})
export class UnauthorizedComponent {}