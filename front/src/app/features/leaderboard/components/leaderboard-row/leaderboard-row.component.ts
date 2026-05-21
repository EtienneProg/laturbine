import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../../../../core/models/player.model';

@Component({
  selector: 'app-leaderboard-row',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard-row.component.html',
})
export class LeaderboardRowComponent {
  @Input() player!: Player;
  @Input() rank!: number;
  @Input() maxElo!: number;

  get medal(): string {
    return this.rank === 1 ? '🥇' : this.rank === 2 ? '🥈' : this.rank === 3 ? '🥉' : '';
  }

  get rankClass(): string {
    return this.rank === 1 ? 'text-yellow-400'
      : this.rank === 2 ? 'text-gray-400'
        : this.rank === 3 ? 'text-amber-600'
          : 'text-muted';
  }

  get barWidth(): string {
    return `${Math.round((this.player.elo / this.maxElo) * 100)}%`;
  }

  get barColor(): string {
    return this.rank === 1 ? 'bg-yellow-400'
      : this.rank === 2 ? 'bg-gray-400'
        : this.rank === 3 ? 'bg-amber-600'
          : this.rank <= 10  ? 'bg-neon'
            : 'bg-muted';
  }

  get winRate(): string {
    const total = this.player.wins + this.player.losses;
    return total === 0 ? '—' : `${Math.round((this.player.wins / total) * 100)}%`;
  }
}
