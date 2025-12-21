import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sequence-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div class="w-full max-w-lg bg-[#e8e8e8] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="p-6 border-b border-black/5 flex justify-between items-center bg-[#f3f3f3]">
          <h2 class="text-xl font-bold text-[#333333]">Create Sequence</h2>
          <button (click)="onClose.emit()" class="text-[#666666] hover:text-[#333333]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="p-6 overflow-y-auto flex-1">
          <div class="mb-6">
            <label class="block text-sm font-semibold text-[#666666] mb-2">Sequence Name</label>
            <input [(ngModel)]="name" placeholder="e.g. HIIT Workout" class="w-full p-3 rounded-xl bg-[#f3f3f3] border border-transparent focus:border-[#5076a3] focus:ring-0 outline-none transition-all" />
          </div>

          <div class="mb-6">
            <label class="block text-sm font-semibold text-[#666666] mb-2">Add Timer Step</label>
            <div class="flex gap-4 items-center bg-[#f3f3f3] p-3 rounded-xl">
              <button (click)="adjustDuration(-5)" class="w-10 h-10 rounded-lg bg-[#e8e8e8] hover:bg-[#e1e1e1] font-bold text-xl">-</button>
              <div class="flex-1 text-center font-mono text-2xl font-bold">{{ currentDuration() }}s</div>
              <button (click)="adjustDuration(5)" class="w-10 h-10 rounded-lg bg-[#e8e8e8] hover:bg-[#e1e1e1] font-bold text-xl">+</button>
              <button (click)="addStep()" class="bg-[#5076a3] text-white p-3 rounded-lg hover:bg-[#406085] transition-colors flex items-center gap-2">
                <span>Add</span>
              </button>
            </div>
          </div>

          <div class="mb-6 bg-[#f3f3f3] p-4 rounded-xl flex flex-col gap-4">
            <div class="flex items-center justify-between cursor-pointer" (click)="toggleLoop()">
              <span class="font-semibold text-[#666666]">Loop Sequence</span>
              <button class="w-12 h-7 rounded-full transition-colors relative" [class]="loop() ? 'bg-[#5076a3]' : 'bg-[#e1e1e1]'">
                <div class="w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 transition-transform" [class]="loop() ? 'left-6' : 'left-1'"></div>
              </button>
            </div>
            @if(loop()) {
               <div class="animate-fadeIn border-t border-black/5 pt-4">
                 <label class="block text-sm font-semibold text-[#666666] mb-2">Loop Count (empty = infinite)</label>
                 <input type="number" [(ngModel)]="loopCount" placeholder="∞" class="w-full p-3 rounded-xl bg-[#e8e8e8] border border-transparent focus:border-[#5076a3] outline-none" />
               </div>
            }
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-[#666666]">Sequence Steps ({{ steps().length }})</label>
            @if(steps().length === 0) {
              <div class="text-center py-8 text-[#666666] bg-[#f3f3f3]/50 rounded-xl border-2 border-dashed border-black/5">No steps added yet</div>
            }
            @for (step of steps(); track step.id; let i = $index) {
              <div class="flex items-center justify-between p-3 bg-[#f3f3f3] rounded-xl animate-fadeIn">
                <div class="flex items-center gap-3">
                  <span class="w-6 h-6 rounded-full bg-[#e1e1e1] flex items-center justify-center text-xs font-bold text-[#666666]">{{ i + 1 }}</span>
                  <span class="font-mono font-bold text-lg">{{ step.duration }}s</span>
                </div>
                <button (click)="removeStep(i)" class="text-[#666666] hover:text-[#c46d6d] p-2">Delete</button>
              </div>
            }
          </div>
        </div>

        <div class="p-6 border-t border-black/5 bg-[#f3f3f3] flex justify-end gap-3">
          <button (click)="onClose.emit()" class="px-6 py-3 rounded-xl font-medium text-[#666666] hover:bg-[#e1e1e1]">Cancel</button>
          <button (click)="handleSave()" [disabled]="!name() || steps().length === 0" class="px-6 py-3 rounded-xl font-medium text-white bg-[#5076a3] hover:bg-[#406085] disabled:opacity-50">Save Sequence</button>
        </div>
      </div>
    </div>
  `
})
export class SequenceBuilderComponent {
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<any>();

  name = signal('');
  currentDuration = signal(30);
  steps = signal<any[]>([]);
  loop = signal(false);
  loopCount = signal<string>('');
  
  Math = Math; // Template access

  adjustDuration(delta: number) {
    this.currentDuration.update(v => Math.max(5, v + delta));
  }

  toggleLoop() {
    this.loop.update(v => !v);
  }

  addStep() {
    this.steps.update(s => [...s, { id: Date.now() + Math.random(), duration: this.currentDuration() }]);
  }

  removeStep(idx: number) {
    this.steps.update(s => s.filter((_, i) => i !== idx));
  }

  handleSave() {
    if (!this.name() || this.steps().length === 0) return;
    this.onSave.emit({
      id: Date.now().toString(),
      name: this.name(),
      steps: this.steps(),
      loop: this.loop(),
      loopCount: this.loop() && this.loopCount() ? parseInt(this.loopCount(), 10) : 0
    });
  }
}