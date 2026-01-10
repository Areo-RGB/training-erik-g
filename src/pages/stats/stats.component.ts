import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatsService } from '../../services/stats.service';
import { VerticalTableComponent } from '../../components/stats/vertical-table.component';
import { TableData } from '../../models/stats';

type Step = 'name' | 'discipline' | 'value' | 'submitting';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, FormsModule, VerticalTableComponent],
  template: `
    <div class="min-h-screen w-full pb-12 animate-enter">
      
      <!-- Header -->
      <header class="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#0B0E14]/80 border-b border-white/5 relative">
        <div class="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img 
              src="https://video-idea.fra1.cdn.digitaloceanspaces.com/h03-logop-removebg-preview.png" 
              alt="Logo" 
              class="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" 
            />
            <h1 class="font-bold text-lg tracking-tight text-[#F1F5F9]">Hertha 03 <span class="text-[#94A3B8] font-light">2014 Stats</span></h1>
          </div>
          
          <button 
            (click)="toggleMenu()"
            class="p-2 rounded-full transition-colors"
            [class]="isMenuOpen() ? 'bg-[#151A23] text-white' : 'text-[#94A3B8] hover:bg-[#151A23]'">
             @if (isMenuOpen()) {
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
             } @else {
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
             }
          </button>
        </div>

        <!-- Dropdown Menu -->
        @if (isMenuOpen()) {
          <div class="absolute top-16 right-0 left-0 bg-[#0B0E14]/95 backdrop-blur-xl border-b border-white/5 p-4 shadow-2xl animate-enter">
             <div class="max-w-md mx-auto space-y-2">
                <button 
                  (click)="openAddData()"
                  class="w-full flex items-center gap-3 p-3 rounded-lg bg-[#151A23] hover:bg-[#1E2532] border border-white/5 hover:border-[#3B82F6]/30 transition-all group"
                >
                  <div class="w-8 h-8 rounded-full bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6] group-hover:bg-[#3B82F6] group-hover:text-white transition-colors">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div class="text-left">
                    <span class="block text-[#F1F5F9] font-medium">Daten erfassen</span>
                    <span class="block text-[#94A3B8] text-xs">Ergebnisse aktualisieren</span>
                  </div>
                </button>
             </div>
          </div>
        }
      </header>

      <!-- Dashboard View -->
      @if (view() === 'dashboard') {
        <main class="max-w-md mx-auto px-4 py-6 space-y-6">
          <div class="flex justify-between items-end px-1">
               <div>
                 <h2 class="text-2xl font-bold text-[#F1F5F9]">Statistiken</h2>
                 <p class="text-[#94A3B8] text-sm">Echtzeit-Tracking</p>
               </div>
               <span class="text-xs bg-[#3B82F6]/10 text-[#3B82F6] px-2 py-1 rounded-full border border-[#3B82F6]/20 animate-pulse">
                 Live
               </span>
          </div>

          <section class="space-y-6">
            <div class="flex items-center justify-between px-1">
               <h3 class="text-[#94A3B8] text-xs font-semibold uppercase tracking-wider">Aktive Tests</h3>
               <span class="text-[#64748B] text-xs">{{ tables().length }} Events</span>
            </div>

            @for (table of tables(); track table.id) {
              <app-vertical-table [data]="table"></app-vertical-table>
            }
          </section>
        </main>
      }

      <!-- Add Data Flow Modal/View -->
      @if (view() === 'add_data') {
        <div class="fixed inset-0 z-50 bg-[#0B0E14] flex flex-col animate-enter">
          <!-- Header -->
          <div class="h-16 border-b border-white/5 flex items-center justify-between px-4 bg-[#0B0E14]/50 backdrop-blur-sm">
            <button 
              (click)="navigateBack()"
              class="p-2 -ml-2 text-[#94A3B8] hover:text-white"
            >
              {{ step() === 'name' ? 'Abbrechen' : 'Zurück' }}
            </button>
            <h2 class="text-[#F1F5F9] font-semibold">
              @switch (step()) {
                @case ('name') { Spieler wählen }
                @case ('discipline') { Test wählen }
                @case ('value') { Ergebnis eingeben }
                @case ('submitting') { Speichert... }
              }
            </h2>
            <div class="w-10"></div>
          </div>

          <div class="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full">
            
            <!-- Step 1: Choose Name -->
            @if (step() === 'name') {
              <div class="grid grid-cols-2 gap-3 animate-enter">
                @for (name of uniqueNames(); track name) {
                  <button
                    (click)="selectName(name)"
                    class="bg-[#151A23] border border-white/5 hover:border-[#3B82F6]/50 hover:bg-[#1E2532] p-4 rounded-xl text-left transition-all"
                  >
                    <span class="text-[#F1F5F9] font-medium text-lg block">{{ name }}</span>
                    <span class="text-[#94A3B8] text-xs">Spieler</span>
                  </button>
                }
              </div>
            }

            <!-- Step 2: Choose Discipline -->
            @if (step() === 'discipline') {
              <div class="space-y-3 animate-enter">
                <div class="mb-4">
                   <span class="text-[#94A3B8] text-sm">Gewählter Spieler:</span>
                   <div class="text-[#3B82F6] font-bold text-xl">{{ selectedName() }}</div>
                </div>
                @for (table of tables(); track table.id) {
                  <button
                    (click)="selectTable(table)"
                    class="w-full bg-[#151A23] border border-white/5 hover:border-[#3B82F6]/50 hover:bg-[#1E2532] p-4 rounded-xl text-left transition-all flex justify-between items-center"
                  >
                    <div>
                      <span class="text-[#F1F5F9] font-medium block">{{ table.title }}</span>
                      <span class="text-[#94A3B8] text-xs uppercase tracking-wider">{{ table.valueType || 'Allgemein' }}</span>
                    </div>
                    <svg class="w-5 h-5 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                }
              </div>
            }

            <!-- Step 3: Enter Value -->
            @if (step() === 'value') {
              <div class="flex flex-col h-full justify-between pb-8 animate-enter">
                <div class="space-y-6">
                  <div class="bg-[#151A23]/50 border border-white/5 rounded-lg p-4 mb-6">
                     <div class="flex justify-between items-center mb-1">
                       <span class="text-[#94A3B8] text-xs uppercase">Spieler</span>
                       <span class="text-[#94A3B8] text-xs uppercase">Test</span>
                     </div>
                     <div class="flex justify-between items-center">
                       <span class="text-[#3B82F6] font-bold">{{ selectedName() }}</span>
                       <span class="text-white font-medium">{{ selectedTable()?.title }}</span>
                     </div>
                  </div>

                  <div>
                    <label class="block text-[#94A3B8] text-sm mb-2 text-center">
                      Ergebnis in <span class="text-white font-bold">{{ getUnitLabel(selectedTable()?.valueType) }}</span>
                    </label>
                    <div class="relative">
                      <input
                        type="number"
                        [(ngModel)]="inputValue"
                        placeholder="0"
                        class="w-full bg-[#0B0E14] border-b-2 border-[#2A3441] focus:border-[#3B82F6] text-center text-5xl font-bold text-white py-4 outline-none placeholder-[#2A3441] transition-colors"
                        autoFocus
                      />
                      @if (selectedTable()?.valueType === 'distance') { <span class="absolute right-0 bottom-6 text-[#64748B] font-mono">m</span> }
                      @if (selectedTable()?.valueType === 'time') { <span class="absolute right-0 bottom-6 text-[#64748B] font-mono">s</span> }
                    </div>
                    @if (error()) {
                      <p class="text-red-500 text-sm text-center mt-2">{{ error() }}</p>
                    }
                  </div>
                </div>

                <button
                  (click)="handleSubmit()"
                  class="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 hover-spring"
                >
                  Speichern
                </button>
              </div>
            }

            <!-- Step 4: Submitting -->
            @if (step() === 'submitting') {
              <div class="h-full flex flex-col items-center justify-center space-y-4 animate-enter">
                <div class="w-12 h-12 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin"></div>
                <p class="text-[#94A3B8]">Datenbank wird aktualisiert...</p>
              </div>
            }
          </div>
        </div>
      }

    </div>
  `
})
export class StatsComponent {
  private statsService = inject(StatsService);

  tables = signal<TableData[]>([]);
  view = signal<'dashboard' | 'add_data'>('dashboard');
  isMenuOpen = signal(false);
  
  // Add Data Flow State
  step = signal<Step>('name');
  selectedName = signal('');
  selectedTable = signal<TableData | null>(null);
  inputValue = signal('');
  error = signal('');

  uniqueNames = computed(() => {
    const names = new Set<string>();
    this.tables().forEach(t => t.rows.forEach(r => names.add(r.name)));
    return Array.from(names).sort();
  });

  constructor() {
    this.statsService.tables$.subscribe(data => {
      this.tables.set(data);
    });
  }

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }

  openAddData() {
    this.isMenuOpen.set(false);
    this.resetFlow();
    this.view.set('add_data');
  }

  resetFlow() {
    this.step.set('name');
    this.selectedName.set('');
    this.selectedTable.set(null);
    this.inputValue.set('');
    this.error.set('');
  }

  navigateBack() {
    const s = this.step();
    if (s === 'name') {
      this.view.set('dashboard');
    } else if (s === 'discipline') {
      this.step.set('name');
    } else if (s === 'value') {
      this.step.set('discipline');
    }
  }

  selectName(name: string) {
    this.selectedName.set(name);
    this.step.set('discipline');
  }

  selectTable(table: TableData) {
    this.selectedTable.set(table);
    this.inputValue.set('');
    this.error.set('');
    this.step.set('value');
  }

  getUnitLabel(type?: string) {
    switch (type) {
      case 'distance': return 'Metern';
      case 'time': return 'Sekunden';
      case 'weight': return 'kg';
      case 'score': return 'Punkten';
      default: return 'Wert';
    }
  }

  async handleSubmit() {
    const valStr = this.inputValue();
    if (!valStr || isNaN(Number(valStr))) {
      this.error.set('Bitte eine gültige Zahl eingeben');
      return;
    }

    this.step.set('submitting');
    try {
      const table = this.selectedTable();
      if (table) {
        await this.statsService.updateMetricEntry(table.id, this.selectedName(), Number(valStr));
        this.view.set('dashboard');
      }
    } catch (err) {
      this.error.set('Fehler beim Speichern. Bitte erneut versuchen.');
      this.step.set('value');
    }
  }
}