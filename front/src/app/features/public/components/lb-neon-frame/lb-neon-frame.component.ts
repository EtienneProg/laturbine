import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lb-neon-frame',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="neon-frame-wrapper">
      <span class="corner top-4 left-4 border-t-4 border-l-4" [class]="cornerColor"></span>
      <span class="corner top-4 right-4 border-t-4 border-r-4" [class]="cornerColor"></span>
      <span class="corner bottom-4 left-4 border-b-4 border-l-4" [class]="cornerColor"></span>
      <span class="corner bottom-4 right-4 border-b-4 border-r-4" [class]="cornerColor"></span>
      <div class="orbit-dot" [class]="dotColor"></div>
      <div class="orbit-dot orbit-dot-2" [class]="dotColor"></div>
      <ng-content />
    </div>
  `,
  styles: [`
    .neon-frame-wrapper {
      position: absolute;
      inset: 0;
      pointer-events: none;
      border-radius: inherit;
    }

    .corner {
      position: absolute;
      width: 1.5rem;
      height: 1.5rem;
      animation: cornerPulse 3s ease-in-out infinite;
    }

    @keyframes cornerPulse {
      0%, 100% { opacity: 1; filter: drop-shadow(0 0 4px currentColor); }
      50%      { opacity: 0.4; filter: none; }
    }

    /* Point qui tourne autour du cadre */
    @keyframes orbitFrame {
      0%   { offset-distance: 0%; }
      100% { offset-distance: 100%; }
    }

    .orbit-dot {
      position: absolute;
      width: 50px;
      height: 6px;
      border-radius: 50%;
      offset-path: inset(0 round 1.5rem);
      animation: orbitFrame 4s linear infinite;
      filter: blur(1px);
      z-index: 10;
      pointer-events: none;
    }

    .orbit-dot-2 {
      animation-delay: -2s; /* moitié de 4s = toujours à l'opposé */
    }

    /* Stagger les coins pour un effet décalé */
    .corner:nth-child(1) { animation-delay: 0s;    }
    .corner:nth-child(2) { animation-delay: 0.75s; }
    .corner:nth-child(3) { animation-delay: 1.5s;  }
    .corner:nth-child(4) { animation-delay: 2.25s; }
  `]
})
export class LbNeonFrameComponent {
  @Input() color: 'purple' | 'cyan' | 'pink' = 'purple';

  get cornerColor(): string {
    if (this.color === 'cyan')  return 'border-cyan-400';
    if (this.color === 'pink')  return 'border-pink-400';
    return 'border-purple-400';
  }

  get dotColor(): string {
    if (this.color === 'cyan') return 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]';
    if (this.color === 'pink') return 'bg-pink-400 shadow-[0_0_8px_#f472b6]';
    return 'bg-purple-400 shadow-[0_0_20px_#a855f7]';
  }
}
