import {
  Component, Input, OnChanges, SimpleChanges,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../../../../core/models/player.model';

@Component({
  selector: '[app-lb-player-row]', // ← sélecteur attribut
  host: { class: 'bg-[#2a1747]/75 rounded-2xl transition-all duration-500 w-full' },

  standalone: true,
  imports: [CommonModule],
  templateUrl: './lb-player-row.component.html',
  styles: [`
    @keyframes rankUp {
      0%   { background: rgba(0,255,136,0.3); transform: translateX(-8px); }
      50%  { background: rgba(0,255,136,0.15); }
      100% { background: transparent; transform: translateX(0); }
    }
    @keyframes rankDown {
      0%   { background: rgba(255,59,92,0.3); transform: translateX(8px); }
      50%  { background: rgba(255,59,92,0.15); }
      100% { background: transparent; transform: translateX(0); }
    }
    @keyframes eloFlash {
      0%,100% { opacity: 1; }
      50%     { opacity: 0.3; }
    }
    @keyframes badgeFade {
      0%   { opacity: 1; transform: translateY(0); }
      70%  { opacity: 1; transform: translateY(-4px); }
      100% { opacity: 0; transform: translateY(-12px); }
    }
    .anim-rank-up   { animation: rankUp   1.2s ease forwards; }
    .anim-rank-down { animation: rankDown 1.2s ease forwards; }
    .anim-elo-flash { animation: eloFlash 0.4s ease 3; }
    .badge-fade     { animation: badgeFade 3s ease forwards; }
  `]
})
export class LbPlayerRowComponent implements OnChanges {
  @Input() player!: Player;
  @Input() rank!: number;
  @Input() grade!: string;
  @Input() lastMatch!: string;

  displayElo    = signal(0);
  prevRank      = signal(0);
  rankDelta     = signal(0);
  animClass     = signal('');
  eloAnimClass  = signal('');
  showBadge     = signal(false);
  eloChanging   = signal(false);
  eloColor      = signal('');

  private eloInterval: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['player']) {
      const prev = changes['player'].previousValue as Player | undefined;
      const curr = changes['player'].currentValue as Player;

      if (!prev) {
        // Premier chargement — pas d'animation
        this.displayElo.set(curr.elo);
        return;
      }

      // ELO a changé
      if (prev.elo !== curr.elo) {
        this.animateElo(prev.elo, curr.elo);
      }
    }

    if (changes['rank']) {
      const prevR = changes['rank'].previousValue as number | undefined;
      const currR = changes['rank'].currentValue as number;

      if (prevR !== undefined && prevR !== currR) {
        const delta = prevR - currR; // positif = monte, négatif = descend
        this.rankDelta.set(delta);
        this.showBadge.set(true);
        this.animClass.set(delta > 0 ? 'anim-rank-up' : 'anim-rank-down');

        // Cache le badge après 3s
        setTimeout(() => {
          this.showBadge.set(false);
          this.animClass.set('');
        }, 3000);
      }
    }
  }

  private animateElo(from: number, to: number): void {
    clearInterval(this.eloInterval);

    const diff     = to - from;
    const duration = 1500; // ms
    const steps    = 60;
    const step     = diff / steps;
    let   current  = from;
    let   count    = 0;

    this.eloColor.set(diff > 0 ? 'text-green-400' : 'text-red-500');
    this.eloAnimClass.set('anim-elo-flash');

    this.eloInterval = setInterval(() => {
      count++;
      current += step;
      this.displayElo.set(Math.round(current));

      if (count >= steps) {
        clearInterval(this.eloInterval);
        this.displayElo.set(to);
        // Remet la couleur normale après 2s
        setTimeout(() => {
          this.eloColor.set('');
          this.eloAnimClass.set('');
        }, 2000);
      }
    }, duration / steps);
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
