import { Component, Input, Output, EventEmitter, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-sequence-timer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative bg-[#e8e8e8] rounded-xl overflow-hidden flex flex-col items-center justify-between min-h-[420px] pb-8 shadow-sm">
      <div class="absolute top-0 w-full h-1 opacity-60 bg-[#8baa8b]"></div>
      
      <div class="absolute top-2 right-2 flex gap-1 z-10">
        <button (click)="onDelete.emit(sequence.id)" class="p-2 text-[#666666] hover:text-[#c46d6d] transition-colors" title="Delete Sequence">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>

      <div class="pt-10 text-center">
        <div class="inline-flex p-4 rounded-full bg-[#f3f3f3] mb-4 text-[#8baa8b]">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-[#333333]">{{ sequence.name }}</h3>
      </div>

      <div class="flex-1 flex flex-col items-center justify-center w-full px-8">
        <div class="flex flex-wrap gap-2 justify-center mb-6">
          <div class="bg-[#f3f3f3] px-4 py-1 rounded-full text-sm font-medium text-[#666666]">
            @if(isFinished()) { Completed } @else { Step {{ currentStepIndex() + 1 }}/{{ sequence.steps.length }} }
          </div>
          @if (sequence.loop) {
            <div class="bg-[#f3f3f3] px-4 py-1 rounded-full text-sm font-medium text-[#666666] flex items-center gap-1">
              <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
              <span>{{ sequence.loopCount ? currentLoop() + '/' + sequence.loopCount : currentLoop() + '/∞' }}</span>
            </div>
          }
        </div>

        <div class="text-[4rem] font-bold font-mono tabular-nums text-[#333333] leading-none my-auto">
          {{ timeLeft() }}s
        </div>

        <div class="h-8 mb-4 text-sm text-[#666666]">
          @if (!isFinished()) {
             @if (currentStepIndex() < sequence.steps.length - 1) {
                <span>Next: {{ sequence.steps[currentStepIndex() + 1].duration }}s</span>
             } @else if (sequence.loop && (sequence.loopCount === 0 || currentLoop() < sequence.loopCount)) {
                <span>Next: {{ sequence.steps[0].duration }}s (Loop)</span>
             }
          }
        </div>

        <div class="flex gap-4 w-full mt-auto pt-6">
          <button (click)="toggle()"
                  class="flex-1 py-3 rounded-lg font-medium text-white shadow-sm transition-all"
                  [ngClass]="getBtnClass()">
            {{ getBtnText() }}
          </button>
          <button (click)="reset()" class="w-14 flex items-center justify-center bg-[#f3f3f3] rounded-lg text-[#666666] hover:bg-[#e1e1e1] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
          </button>
        </div>
      </div>
    </div>
  `
})
export class SequenceTimerComponent implements OnDestroy {
  @Input() sequence: any;
  @Output() onDelete = new EventEmitter<string>();

  private audio = inject(AudioService);
  
  currentStepIndex = signal(0);
  currentLoop = signal(1);
  timeLeft = signal(0);
  isRunning = signal(false);
  isFinished = signal(false);
  
  private timerRef: any;

  ngOnInit() {
    this.timeLeft.set(this.sequence.steps[0]?.duration || 0);
  }

  getBtnClass() {
    if (this.isRunning()) return 'bg-[#c46d6d] hover:bg-red-500';
    if (this.isFinished()) return 'bg-[#666666]';
    return 'bg-[#8baa8b] hover:bg-[#7A997A]';
  }

  getBtnText() {
    if (this.isRunning()) return 'Stop';
    if (this.isFinished()) return 'Done';
    return 'Start';
  }

  reset() {
    this.isRunning.set(false);
    this.isFinished.set(false);
    clearInterval(this.timerRef);
    this.currentStepIndex.set(0);
    this.currentLoop.set(1);
    this.timeLeft.set(this.sequence.steps[0]?.duration || 0);
  }

  async toggle() {
    if (this.isFinished()) {
      this.reset();
      return;
    }
    if (!this.isRunning()) await this.audio.resumeAudioContext();

    if (this.isRunning()) {
      this.isRunning.set(false);
      clearInterval(this.timerRef);
    } else {
      this.isRunning.set(true);
      this.timerRef = setInterval(() => {
        const t = this.timeLeft();
        if (t <= 1) {
          this.audio.playBeep(800, 0.3);
          
          // Next step
          if (this.currentStepIndex() < this.sequence.steps.length - 1) {
            this.currentStepIndex.update(i => i + 1);
            this.timeLeft.set(this.sequence.steps[this.currentStepIndex()].duration);
            return;
          }
          
          // Loop
          if (this.sequence.loop) {
            const max = this.sequence.loopCount || 0;
            if (max === 0 || this.currentLoop() < max) {
              this.currentStepIndex.set(0);
              this.currentLoop.update(l => l + 1);
              this.timeLeft.set(this.sequence.steps[0].duration);
              return;
            }
          }

          // Finish
          this.isRunning.set(false);
          this.isFinished.set(true);
          this.timeLeft.set(0);
          clearInterval(this.timerRef);

        } else {
          this.timeLeft.set(t - 1);
        }
      }, 1000);
    }
  }

  ngOnDestroy() {
    clearInterval(this.timerRef);
  }
}