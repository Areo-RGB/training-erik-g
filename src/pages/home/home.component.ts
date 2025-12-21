import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      @for (tool of tools; track tool.title; let i = $index) {
        <a [routerLink]="tool.link"
           [style.animation-delay]="(i * 100) + 'ms'"
           class="animate-enter opacity-0 group p-6 rounded-2xl bg-[#e8e8e8] border border-black/5 shadow-sm 
                  hover-spring cursor-pointer flex flex-col items-start gap-4">
          
          <div class="p-3 rounded-xl bg-[#f3f3f3] text-[#666666] group-hover:text-[#5076a3] transition-colors">
            <!-- Dynamic Icon Rendering -->
            @if (tool.icon === 'timers') {
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            }
            @if (tool.icon === 'farben') {
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            }
            @if (tool.icon === 'kettenrechner') {
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="8" x2="8" y2="8" />
                <line x1="16" y1="16" x2="16" y2="16" />
              </svg>
            }
            @if (tool.icon === 'intervall') {
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2v20" />
                <path d="M2 12h20" />
                <path d="M12 2a10 10 0 0 1 10 10" />
                <path d="M2 12a10 10 0 0 1 10-10" />
              </svg>
            }
          </div>

          <div>
            <h3 class="text-lg font-bold text-[#333333] mb-1 group-hover:text-[#5076a3] transition-colors">{{ tool.title }}</h3>
            <p class="text-sm text-[#666666] leading-relaxed">{{ tool.description }}</p>
          </div>
        </a>
      }
    </div>
  `
})
export class HomeComponent {
  tools = [
    {
      title: 'Farben',
      description: 'Stroop effect trainer. Flashes colors and words to improve reaction speed.',
      link: '/farben',
      icon: 'farben',
    },
    {
      title: 'Kettenrechner',
      description: 'Mental math chain calculator. Solve continuous operations.',
      link: '/kettenrechner',
      icon: 'kettenrechner',
    },
    {
      title: 'Timers',
      description: 'Interval timers and loop presets for various training sessions.',
      link: '/timers',
      icon: 'timers',
    },
    {
      title: 'Intervall',
      description: 'Set custom intervals for audio beep reminders.',
      link: '/intervall',
      icon: 'intervall',
    },
  ];
}