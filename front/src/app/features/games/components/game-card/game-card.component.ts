import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Game } from '../../../../core/models/game.model';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './game-card.component.html',
})
export class GameCardComponent {
  @Input() game!: Game;
  @Output() setResult = new EventEmitter<Game>();

  get isOngoing(): boolean {
    return this.game.status === 'ONGOING';
  }

  get winnerTeam() {
    return this.game.teams.find(t => t.id === this.game.winnerTeamId);
  }

  get borderClass(): string {
    return this.isOngoing
      ? 'border-orange/40 shadow-[0_0_20px_rgba(255,107,53,0.08)]'
      : 'border-border';
  }

  getTeamPlayerNames(team: any): string {
    return team.players.map((tp: any) => tp.player.name).join(', ');
  }

  isWinnerTeam(teamId: number): boolean {
    return this.game.winnerTeamId === teamId;
  }
}
