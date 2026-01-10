import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableData } from '../../models/stats';

type SortKey = 'name' | 'value';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-vertical-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full bg-[#151A23] border border-white/5 rounded-xl overflow-hidden shadow-sm flex flex-col transition-all duration-300">
      <div 
        class="bg-[#1E2532]/50 px-4 py-3 border-b border-white/5 flex justify-between items-center cursor-pointer hover:bg-[#1E2532]/80 transition-colors select-none"
        (click)="toggleExpand()"
      >
        <div class="flex items-center gap-3">
          <!-- Chevron only shows if there is more to expand -->
          @if (hasMore()) {
            <div [class.rotate-180]="isExpanded()" class="transition-transform duration-200 text-[#94A3B8]">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          }
          <h2 class="text-[#F1F5F9] font-semibold text-lg tracking-tight">{{ data().title }}</h2>
        </div>
        <span class="text-xs font-mono text-[#94A3B8] bg-[#0B0E14]/50 px-2 py-1 rounded">
          {{ getTableShortId() }}
        </span>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-[#0B0E14]/50 text-[#94A3B8] font-medium uppercase text-xs">
            <tr>
              <th 
                class="px-4 py-3 tracking-wider cursor-pointer group select-none hover:bg-[#1E2532]/50 transition-colors"
                (click)="handleSort('name', $event)"
              >
                <div class="flex items-center gap-1">
                  {{ col1Title() }}
                  <span [class.opacity-0]="sortKey() !== 'name'" class="text-[#3B82F6]">
                    @if (sortDirection() === 'asc') {
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
                    } @else {
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                    }
                  </span>
                </div>
              </th>
              <th 
                class="px-4 py-3 text-right tracking-wider cursor-pointer group select-none hover:bg-[#1E2532]/50 transition-colors"
                (click)="handleSort('value', $event)"
              >
                <div class="flex items-center justify-end gap-1">
                  {{ col2Title() }}
                  <span [class.opacity-0]="sortKey() !== 'value'" class="text-[#3B82F6]">
                    @if (sortDirection() === 'asc') {
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
                    } @else {
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                    }
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            @for (row of rowsToDisplay(); track row.id; let i = $index) {
              <tr class="hover:bg-[#1E2532]/30 transition-colors">
                <td class="px-4 py-3 text-[#CBD5E1] font-medium">
                  <div class="flex items-center gap-3">
                    <span [class]="getRankClass(i)" class="font-mono text-xs w-5 text-right">
                      {{ i + 1 }}.
                    </span>
                    {{ row.name }}
                  </div>
                </td>
                <td class="px-4 py-3 text-right text-[#F1F5F9] font-mono">
                  {{ formatValue(row.value) }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      
      <!-- Footer / Expansion Toggle -->
      <div class="bg-[#0B0E14] px-4 py-2 border-t border-white/5 flex justify-between items-center">
        @if (hasMore()) {
          <button 
            (click)="toggleExpand($event)"
            class="text-xs text-[#94A3B8] hover:text-white font-medium flex items-center gap-1 transition-colors"
          >
            {{ isExpanded() ? 'Weniger' : 'Alle anzeigen (' + sortedRows().length + ')' }}
            <svg 
              [class.rotate-180]="isExpanded()"
              class="w-3 h-3 transition-transform duration-200" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        } @else {
          <span class="text-xs text-[#64748B]">Alle Einträge angezeigt</span>
        }
        
        <button class="text-xs text-[#3B82F6] hover:text-blue-400 font-medium transition-colors">
          Details &rarr;
        </button>
      </div>
    </div>
  `
})
export class VerticalTableComponent {
  data = signal<TableData>({ id: '', title: '', rows: [] } as any);
  @Input({ alias: 'data' }) set _data(val: TableData) {
    this.data.set(val);
  }

  isExpanded = signal(false);
  sortKey = signal<SortKey | null>(null);
  sortDirection = signal<SortDirection>('desc');

  col1Title = computed(() => this.data().headers?.[0] || 'Name');
  col2Title = computed(() => this.data().headers?.[1] || 'Wert');

  sortedRows = computed(() => {
    const rows = [...this.data().rows];
    const key = this.sortKey();
    if (!key) return rows; // Default order (usually as returned from DB or sorted by value implicitly)

    return rows.sort((a, b) => {
      const valA = a[key];
      const valB = b[key];
      const direction = this.sortDirection();

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  });

  rowsToDisplay = computed(() => {
    return this.isExpanded() ? this.sortedRows() : this.sortedRows().slice(0, 3);
  });

  hasMore = computed(() => this.sortedRows().length > 3);

  handleSort(key: SortKey, e: Event) {
    e.stopPropagation();
    if (this.sortKey() === key) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(key);
      this.sortDirection.set(key === 'name' ? 'asc' : 'desc');
    }
  }

  toggleExpand(e?: Event) {
    if (e) e.stopPropagation();
    if (this.hasMore()) {
      this.isExpanded.update(v => !v);
    }
  }

  getTableShortId() {
    return this.data().id.split('-')[1]?.toUpperCase() || 'ID';
  }

  getRankClass(index: number) {
    if (index === 0) return 'text-yellow-500 font-bold';
    if (index === 1) return 'text-[#E2E8F0] font-bold';
    if (index === 2) return 'text-amber-700 font-bold';
    return 'text-[#64748B]';
  }

  formatValue(val: number) {
    const type = this.data().valueType;
    switch (type) {
      case 'distance': return `${val} m`;
      case 'time': return `${val.toFixed(2)} s`;
      case 'weight': return `${val} kg`;
      case 'score': return `${Number.isInteger(val) ? val : val.toFixed(1)}`;
      case 'currency': return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
      default: return `${val}`;
    }
  }
}