import { Component, OnDestroy, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService } from '../../services/audio.service';

declare var confetti: any;

@Component({
  selector: 'app-kettenrechner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-[#f3f3f3]"
         [class]="status() !== 'config' ? 'fixed inset-0 z-40 bg-[#f3f3f3]' : ''">
      
      @if (status() !== 'config') {
        <div class="absolute top-0 left-0 w-full h-1 bg-[#5076a3]/50 animate-enter"></div>
      }

      <div class="w-full max-w-2xl bg-[#e8e8e8] rounded-xl shadow-sm flex flex-col items-center relative overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
           [class]="status() === 'config' ? 'p-12 min-h-[500px] animate-enter-scale' : 'h-full w-full max-w-none rounded-none p-12'">

        <!-- CONFIG MODE -->
        @if (status() === 'config') {
          <div class="w-full flex flex-col gap-6 items-center flex-1 justify-center animate-enter">
            <h2 class="text-3xl font-bold text-[#333333]">Ready?</h2>

            <!-- Levels -->
            <div class="w-full bg-[#f3f3f3] rounded-xl overflow-hidden transition-all">
              <button (click)="toggleLevels()"
                      class="w-full flex items-center justify-between p-4 hover:bg-[#e1e1e1]/50 transition-colors font-semibold">
                <span>Levels</span>
                <div [class]="levelsOpen() ? 'rotate-180' : ''" class="transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </button>
              
              @if (levelsOpen()) {
                <div class="p-4 grid grid-cols-1 gap-3 border-t border-black/5 animate-enter">
                  <button (click)="startGame(5, 5)" class="p-3 bg-[#e8e8e8] rounded-lg hover:border-[#5076a3] border-2 border-transparent transition-all text-left group hover-spring">
                    <div class="font-bold text-[#5076a3]">Level 1</div>
                    <div class="text-xs text-[#666666]">Speed: 5s, Steps: 5</div>
                  </button>
                  <button (click)="startGame(5, 10)" class="p-3 bg-[#e8e8e8] rounded-lg hover:border-[#5076a3] border-2 border-transparent transition-all text-left group hover-spring delay-75">
                    <div class="font-bold text-[#5076a3]">Level 2</div>
                    <div class="text-xs text-[#666666]">Speed: 5s, Steps: 10</div>
                  </button>
                  <button (click)="startGame(4, 5)" class="p-3 bg-[#e8e8e8] rounded-lg hover:border-[#5076a3] border-2 border-transparent transition-all text-left group hover-spring delay-150">
                    <div class="font-bold text-[#5076a3]">Level 3</div>
                    <div class="text-xs text-[#666666]">Speed: 4s, Steps: 5</div>
                  </button>
                </div>
              }
            </div>

            <!-- Manual Config -->
            <div class="w-full bg-[#f3f3f3] rounded-xl p-6 flex flex-col gap-6">
              <div class="flex flex-col items-center">
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Speed (Seconds)</span>
                <div class="flex items-center gap-6">
                  <button (click)="adjustSpeed(-1)" class="w-10 h-10 rounded-full bg-[#e8e8e8] hover:bg-[#e1e1e1] font-bold text-xl btn-press">-</button>
                  <span class="text-2xl font-black w-16 text-center tabular-nums">{{ speed() }}s</span>
                  <button (click)="adjustSpeed(1)" class="w-10 h-10 rounded-full bg-[#e8e8e8] hover:bg-[#e1e1e1] font-bold text-xl btn-press">+</button>
                </div>
              </div>
              <div class="flex flex-col items-center">
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Steps</span>
                <div class="flex items-center gap-6">
                  <button (click)="adjustTargetSteps(-1)" class="w-10 h-10 rounded-full bg-[#e8e8e8] hover:bg-[#e1e1e1] font-bold text-xl btn-press">-</button>
                  <span class="text-2xl font-black w-16 text-center tabular-nums">{{ targetSteps() }}</span>
                  <button (click)="adjustTargetSteps(1)" class="w-10 h-10 rounded-full bg-[#e8e8e8] hover:bg-[#e1e1e1] font-bold text-xl btn-press">+</button>
                </div>
              </div>

              <!-- Beep Toggle -->
              <div class="w-full border-t border-black/5 pt-4 mt-2">
                <div class="flex items-center justify-between w-full px-4 py-3 bg-[#e8e8e8] rounded-lg cursor-pointer" (click)="toggleBeep()">
                  <span class="font-semibold text-sm text-[#666666]">Beep on Step</span>
                  <button class="w-12 h-7 rounded-full transition-colors relative"
                          [class]="playBeepOnStep() ? 'bg-[#5076a3]' : 'bg-[#e1e1e1]'">
                    <div class="w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 transition-transform"
                         [class]="playBeepOnStep() ? 'left-6' : 'left-1'"></div>
                  </button>
                </div>
              </div>
            </div>

            <button (click)="startGame()"
                    class="bg-[#5076a3] text-white px-8 py-4 rounded-xl text-lg font-medium shadow-sm hover-spring transition-all mt-6">
              Start
            </button>
          </div>
        }

        <!-- PLAYING MODE -->
        @if (status() === 'playing') {
          <div class="flex-1 flex flex-col items-center justify-center w-full animate-enter">
            <div class="flex flex-col items-center">
              <div [style.fontSize.rem]="fontSize()"
                   class="font-bold tracking-tighter tabular-nums transition-all duration-200"
                   [class]="['3','2','1'].includes(display()) ? 'text-[#5076a3] scale-110' : 'text-[#333333]'">
                {{ display() }}
              </div>

              @if (!['3','2','1'].includes(display())) {
                <div class="mt-4 text-3xl font-bold text-[#666666] tabular-nums animate-enter delay-100">
                  {{ currentStep() }}/{{ targetSteps() }}
                </div>
              }
            </div>

            <div class="mt-12 flex flex-col items-center gap-4 animate-enter delay-200">
              <div class="flex items-center gap-4">
                <button (click)="stopGame()" class="bg-[#e1e1e1] text-[#666666] px-6 py-4 rounded-xl text-lg font-medium shadow-sm hover:bg-[#d4d4d4] transition-all btn-press">
                  Stop
                </button>
                <button (click)="restartGame()" class="bg-[#666666] text-white px-8 py-4 rounded-xl text-lg font-medium shadow-sm hover:opacity-90 transition-all btn-press">
                  Restart
                </button>
              </div>
              
              <div class="flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
                <button (click)="adjustFontSize(-1)" class="p-2 rounded-full bg-[#f3f3f3] hover:bg-[#e1e1e1] btn-press">-</button>
                <button (click)="adjustFontSize(1)" class="p-2 rounded-full bg-[#f3f3f3] hover:bg-[#e1e1e1] btn-press">+</button>
              </div>
            </div>
          </div>
        }

        <!-- PENDING MODE (INPUT) -->
        @if (status() === 'pending') {
          <div class="flex-1 flex flex-col items-center justify-center w-full animate-enter">
            <div class="flex flex-col items-center w-full max-w-xs">
              <div class="w-full bg-[#f3f3f3] rounded-xl p-4 mb-6 text-center min-h-[4rem] flex items-center justify-center shadow-inner">
                <span class="text-4xl font-bold tabular-nums text-[#333333]">
                  {{ userAnswer() || '?' }}
                </span>
              </div>

              <div class="grid grid-cols-3 gap-3 w-full mb-6">
                @for (digit of [1,2,3,4,5,6,7,8,9]; track digit; let i = $index) {
                  <button (click)="appendDigit(digit)"
                          [style.animation-delay]="(i * 30) + 'ms'"
                          class="animate-enter opacity-0 p-4 text-2xl font-bold bg-white rounded-xl shadow-[0_4px_0_0_#ccc] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all">
                    {{ digit }}
                  </button>
                }
                <button (click)="appendDigit(0)" class="animate-enter delay-300 opacity-0 p-4 text-2xl font-bold bg-white rounded-xl shadow-[0_4px_0_0_#ccc] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all">0</button>
                <button (click)="userAnswer.set('')" class="animate-enter delay-300 opacity-0 p-4 text-xl font-bold bg-red-100 text-[#c46d6d] rounded-xl shadow-[0_4px_0_0_#d4a0a0] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all">C</button>
              </div>

              <button (click)="checkAnswer()"
                      class="w-full bg-[#8baa8b] text-white px-8 py-4 rounded-xl text-lg font-medium shadow-[0_4px_0_0_#5e8a5e] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all animate-enter delay-500 opacity-0">
                Enter
              </button>
            </div>
          </div>
        }

        <!-- RESULT MODE -->
        @if (status() === 'result') {
          <div class="flex-1 flex flex-col items-center justify-center w-full text-center animate-enter">
            @if (showCelebration()) {
              <div class="text-6xl mb-4 animate-celebrate">🎉</div>
            }
            @if (isCorrect() === false) {
              <div class="text-6xl mb-4 animate-enter-scale">❌</div>
            }

            <h2 class="text-[#666666] font-medium text-sm uppercase tracking-widest mb-4 mt-4 delay-100 animate-enter opacity-0">Result</h2>
            <div [style.fontSize.rem]="fontSize()"
                 class="font-bold leading-none mb-8 tabular-nums delay-150 animate-enter opacity-0"
                 [class]="showCelebration() ? 'text-[#8baa8b]' : 'text-[#5076a3]'">
              {{ total() }}
            </div>
            <div class="bg-[#f3f3f3] px-6 py-3 rounded-full font-mono text-base text-[#666666] delay-200 animate-enter opacity-0">
              0 {{ history().join(' ') }} = {{ total() }}
            </div>

            <div class="mt-12 flex items-center justify-center gap-4 delay-300 animate-enter opacity-0">
              <button (click)="stopGame()"
                      class="bg-[#e1e1e1] text-[#666666] px-6 py-4 rounded-xl text-lg font-medium shadow-sm hover:bg-[#d4d4d4] transition-all btn-press">
                Settings
              </button>
              <button (click)="restartGame()"
                      class="bg-[#666666] text-white px-8 py-4 rounded-xl text-lg font-medium shadow-sm hover:opacity-90 transition-all btn-press">
                Restart
              </button>
            </div>
          </div>
        }

      </div>
    </div>
  `
})
export class KettenrechnerComponent implements OnDestroy {
  private audio = inject(AudioService);

  // Persistence
  speed = signal(parseInt(localStorage.getItem('kettenrechner_speed') || '5', 10));
  targetSteps = signal(parseInt(localStorage.getItem('kettenrechner_targetSteps') || '5', 10));
  fontSize = signal(parseInt(localStorage.getItem('kettenrechner_fontSize') || '6', 10));
  playBeepOnStep = signal(localStorage.getItem('kettenrechner_playBeepOnStep') === 'true');

  status = signal<'config' | 'playing' | 'pending' | 'result'>('config');
  levelsOpen = signal(false);

  display = signal('Ready?');
  total = signal(0);
  history = signal<string[]>([]);
  userAnswer = signal('');
  isCorrect = signal<boolean | null>(null);
  showCelebration = signal(false);
  currentStep = signal(0);

  private timerRef: any = null;
  private gameAudio: HTMLAudioElement | null = null;

  constructor() {
    effect(() => localStorage.setItem('kettenrechner_speed', String(this.speed())));
    effect(() => localStorage.setItem('kettenrechner_targetSteps', String(this.targetSteps())));
    effect(() => localStorage.setItem('kettenrechner_fontSize', String(this.fontSize())));
    effect(() => localStorage.setItem('kettenrechner_playBeepOnStep', String(this.playBeepOnStep())));
  }

  toggleLevels() {
    this.levelsOpen.update(v => !v);
  }

  adjustSpeed(delta: number) {
    this.speed.update(v => Math.max(1, Math.min(30, v + delta)));
  }

  adjustTargetSteps(delta: number) {
    this.targetSteps.update(v => Math.max(1, v + delta));
  }

  toggleBeep() {
    this.playBeepOnStep.update(v => !v);
  }

  adjustFontSize(delta: number) {
    this.fontSize.update(v => Math.max(2, Math.min(20, v + delta)));
  }

  async startGame(overrideSpeed?: number, overrideSteps?: number) {
    if (this.timerRef) clearInterval(this.timerRef);

    if (overrideSpeed) this.speed.set(overrideSpeed);
    if (overrideSteps) this.targetSteps.set(overrideSteps);

    await this.audio.resumeAudioContext();
    this.status.set('playing');
    this.total.set(0);
    this.history.set([]);
    this.currentStep.set(0);
    this.stopSound();

    this.runCountdown();
  }

  restartGame() {
    this.startGame();
  }

  stopGame() {
    this.stopSound();
    if (this.timerRef) clearInterval(this.timerRef);
    this.status.set('config');
  }

  private runCountdown() {
    const seq = ['3', '2', '1'];
    let idx = 0;
    this.display.set(seq[0]);

    this.timerRef = setInterval(() => {
      idx++;
      if (idx < seq.length) {
        this.display.set(seq[idx]);
      } else {
        clearInterval(this.timerRef);
        this.runGameLoop();
      }
    }, 1000);
  }

  private runGameLoop() {
    let currentTotal = 0;
    let steps = 0;
    this.currentStep.set(0);

    const tick = () => {
      if (steps >= this.targetSteps()) {
        this.finishGame(currentTotal);
        return;
      }

      const n = Math.floor(Math.random() * 9) + 1;
      let add = Math.random() > 0.5;
      if (!add && currentTotal - n < 0) add = true;

      currentTotal = add ? currentTotal + n : currentTotal - n;
      const opStr = add ? `+${n}` : `-${n}`;

      if (this.playBeepOnStep()) {
        this.audio.playBeep(600, 0.1);
      }

      this.display.set(opStr);
      this.total.set(currentTotal); // internally tracking, not showing
      this.history.update(h => [...h, opStr]);
      this.currentStep.set(steps + 1);
      steps++;
    };

    tick();
    this.timerRef = setInterval(tick, this.speed() * 1000);
  }

  private finishGame(finalTotal: number) {
    clearInterval(this.timerRef);
    this.total.set(finalTotal);
    this.status.set('pending');
    this.display.set('?');
    this.userAnswer.set('');
    this.isCorrect.set(null);
    this.showCelebration.set(false);
  }

  appendDigit(digit: number) {
    this.userAnswer.update(s => s + digit.toString());
  }

  checkAnswer() {
    const ans = parseInt(this.userAnswer(), 10);
    const correct = ans === this.total();
    this.isCorrect.set(correct);
    this.showCelebration.set(correct);

    if (correct) {
      this.playSound('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg'); // Using a reliable google sound for demo
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ff6347', '#ffa500', '#32cd32', '#1e90ff', '#ff69b4', '#8BAA8B', '#5076A3'],
        });
      }
    } else {
      this.playSound('https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg');
    }
    this.status.set('result');
  }

  playSound(src: string) {
    this.stopSound();
    this.gameAudio = new Audio(src);
    this.gameAudio.volume = 0.5;
    this.gameAudio.play().catch(() => {});
  }

  stopSound() {
    if (this.gameAudio) {
      this.gameAudio.pause();
      this.gameAudio = null;
    }
  }

  ngOnDestroy() {
    clearInterval(this.timerRef);
    this.stopSound();
  }
}