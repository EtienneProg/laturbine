import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Game } from '../../../../core/models/game.model';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './activity-feed.component.html',
})
export class ActivityFeedComponent {
  @Input() games: Game[] = [];

  getTeamNames(game: Game, teamIndex: number): string {
    const team = game.teams[teamIndex];
    if (!team) return '—';
    return team.players.map(tp => tp.player.name).join(' & ');
  }
}
