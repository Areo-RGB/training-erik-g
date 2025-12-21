import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  template: `
    <div class="h-full w-full min-h-screen overflow-y-auto overflow-x-hidden bg-[#f3f3f3] text-[#333333] font-sans antialiased selection:bg-[#5076a3] selection:text-white">
      <!-- Navbar -->
      <nav class="w-full bg-[#f3f3f3]/95 backdrop-blur-sm sticky top-0 z-50 border-b border-black/5 py-4 mb-4">
        <div class="max-w-4xl mx-auto px-6 flex items-center gap-4">
          
          <!-- Home Link with Grid Icon -->
          <a routerLink="/" class="flex items-center gap-3 group cursor-pointer text-[#333333] hover:text-[#5076a3] transition-colors select-none">
            <div class="text-[#5076a3] group-hover:scale-105 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
            </div>
            <h1 class="text-xl font-semibold tracking-tight">
              Training Erik
            </h1>
          </a>

        </div>
      </nav>

      <!-- Main Content -->
      <main class="flex-1 max-w-4xl mx-auto w-full px-6 pb-12">
        <ng-content></ng-content>
      </main>
    </div>
  `
})
export class LayoutComponent {}