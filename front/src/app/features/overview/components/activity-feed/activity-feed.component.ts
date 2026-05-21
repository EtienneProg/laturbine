import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Duel } from '../../../../core/models/duel.model';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './activity-feed.component.html',
})
export class ActivityFeedComponent {
  @Input() duels: Duel[] = [];

  getTeamNames(duel: Duel, teamIndex: number): string {
    return duel.teams[teamIndex].players.map(p => p.player.name).join(' & ');
  }

  protected readonly console = console;
}
