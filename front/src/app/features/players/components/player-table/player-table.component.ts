import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../../../../core/models/player.model';

@Component({
  selector: 'app-player-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-table.component.html',
})
export class PlayerTableComponent {
  @Input() players: Player[] = [];
  @Output() edit       = new EventEmitter<Player>();
  @Output() delete     = new EventEmitter<Player>();
  @Output() viewDetail = new EventEmitter<Player>();

  get sorted(): Player[] {
    return [...this.players].sort((a, b) => b.elo - a.elo);
  }

  winRate(p: Player): string {
    const total = p.wins + p.losses;
    return total === 0 ? '—' : `${Math.round((p.wins / total) * 100)}%`;
  }
}
