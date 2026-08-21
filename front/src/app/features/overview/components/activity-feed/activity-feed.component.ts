import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Game, Team } from '../../../../core/models/game.model';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './activity-feed.component.html',
})
export class ActivityFeedComponent {
  @Input() games: Game[] = [];

  private findTeam(game: Game, name: string): Team | undefined {
    return game.teams.find((t) => t.name === name);
  }

  private teamNames(team: Team | undefined): string {
    if (!team || team.players.length === 0) return '—';
    return team.players.map((tp) => tp.player.name).join(' & ');
  }

  modeKey(game: Game): string {
    return game.gameMode?.key ?? 'DUEL';
  }

  modeIcon(game: Game): string {
    return game.gameMode?.icon ?? '🎮';
  }

  // ─── DUEL ───
  duelTeamNames(game: Game, teamIndex: number): string {
    return this.teamNames(game.teams[teamIndex]);
  }

  // ─── VAMPIRE ───
  vampireNames(game: Game): string {
    return this.teamNames(this.findTeam(game, 'Vampires'));
  }

  villagerNames(game: Game): string {
    return this.teamNames(this.findTeam(game, 'Villageois'));
  }

  // ─── HUNGER GAMES ───
  // Les participants ne sont connus qu'une fois la partie terminée
  // (la team "Survivants" est créée au moment du résultat)
  hungerGamesParticipants(game: Game): string {
    const all = game.teams.flatMap((t) => t.players.map((tp) => tp.player.name));
    return all.length > 0 ? all.join(', ') : '';
  }
}
