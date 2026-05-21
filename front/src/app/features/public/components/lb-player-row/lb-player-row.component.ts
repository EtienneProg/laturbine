import {
  Component, Input, OnChanges, SimpleChanges,
  signal, ElementRef, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../../../../core/models/player.model';

@Component({
  selector: '[app-lb-player-row]',
  host: {
    class: 'bg-[#2a1747]/75 rounded-2xl',
  },
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lb-player-row.component.html',
  styles: [`
    @keyframes eloFlash {
      0%,100% { opacity: 1; }
      50%     { opacity: 0.3; }
    }
    @keyframes badgeFade {
      0%   { opacity: 1; transform: translateY(0); }
      70%  { opacity: 1; transform: translateY(-4px); }
      100% { opacity: 0; transform: translateY(-12px); }
    }
    :host {
      display: table-row;
      transition: background 0.5s ease;
    }
    .anim-elo-flash { animation: eloFlash 0.4s ease 3; }
    .badge-fade     { animation: badgeFade 3s ease forwards; }
  `]
})
export class LbPlayerRowComponent implements OnChanges {
  @Input() player!:    Player;
  @Input() rank!:      number;
  @Input() grade!:     string;
  @Input() lastMatch!: string;

  displayElo   = signal(0);
  rankDelta    = signal(0);
  animClass    = signal('');
  eloAnimClass = signal('');
  showBadge    = signal(false);
  eloColor     = signal('');

  private el          = inject(ElementRef);
  private eloInterval: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['player']) {
      const prev = changes['player'].previousValue as Player | undefined;
      const curr = changes['player'].currentValue as Player;
      if (!prev) {
        this.displayElo.set(curr.elo);
        return;
      }
      if (prev.elo !== curr.elo) this.animateElo(prev.elo, curr.elo);
    }

    if (changes['rank']) {
      const prevR = changes['rank'].previousValue as number | undefined;
      const currR = changes['rank'].currentValue as number;
      if (prevR !== undefined && prevR !== currR) {
        const delta = prevR - currR;
        this.rankDelta.set(delta);
        this.showBadge.set(true);
        setTimeout(() => { this.showBadge.set(false); }, 3500);
      }
    }
  }

  // Appelé depuis le parent AVANT le refresh pour mémoriser la position
  getRect(): DOMRect {
    return this.el.nativeElement.getBoundingClientRect();
  }

  // Appelé depuis le parent APRÈS le refresh pour lancer le glissement
  playFlip(fromY: number): void {
    const toY    = this.el.nativeElement.getBoundingClientRect().top;
    const deltaY = fromY - toY;
    if (Math.abs(deltaY) < 2) return;

    const el = this.el.nativeElement as HTMLElement;
    el.style.transition = 'none';
    el.style.transform  = `translateY(${deltaY}px)`;

    // Force reflow
    el.getBoundingClientRect();

    el.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    el.style.transform  = 'translateY(0)';

    // Nettoyage
    setTimeout(() => {
      el.style.transition = '';
      el.style.transform  = '';
    }, 650);
  }

  private animateElo(from: number, to: number): void {
    clearInterval(this.eloInterval);
    const diff  = to - from;
    const steps = 60;
    const step  = diff / steps;
    let current = from;
    let count   = 0;

    this.eloColor.set(diff > 0 ? 'text-green-400' : 'text-red-500');
    this.eloAnimClass.set('anim-elo-flash');

    this.eloInterval = setInterval(() => {
      count++;
      current += step;
      this.displayElo.set(Math.round(current));
      if (count >= steps) {
        clearInterval(this.eloInterval);
        this.displayElo.set(to);
        setTimeout(() => { this.eloColor.set(''); this.eloAnimClass.set(''); }, 2000);
      }
    }, 1500 / steps);
  }

  get rankShadow(): string {
    if (this.rank === 1) return 'box-shadow: 0 0 20px #facc15';
    if (this.rank === 2) return 'box-shadow: 0 0 18px #e5e7eb';
    if (this.rank === 3) return 'box-shadow: 0 0 18px #fb923c';
    return 'box-shadow: 0 0 10px rgba(34,211,238,.35)';
  }

  get rankTextColor(): string {
    if (this.rank === 1) return 'text-yellow-400';
    if (this.rank === 2) return 'text-gray-400';
    if (this.rank === 3) return 'text-orange-400';
    return 'text-cyan-400';
  }

  get borderColor(): string {
    if (this.rank === 1) return 'border-yellow-400';
    if (this.rank === 2) return 'border-gray-400';
    if (this.rank === 3) return 'border-orange-400';
    return 'border-cyan-400';
  }

  get eloTextColor(): string {
    if (this.eloColor()) return this.eloColor();
    if (this.rank === 1) return 'text-yellow-300';
    if (this.rank === 2) return 'text-gray-300';
    if (this.rank === 3) return 'text-orange-300';
    return 'text-cyan-300';
  }
}
