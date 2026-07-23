import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PlayerService } from '../../core/services/player.service';
import { SessionService } from '../../core/services/session.service';
import { Player } from '../../core/models/player.model';
import { Session } from '../../core/models/session.model';
import { ActivityFeedComponent } from './components/activity-feed/activity-feed.component';
import { QuickStatsComponent } from './components/quick-stats/quick-stats.component';
import {GameService} from '../../core/services/game.service';
import {Game} from '../../core/models/game.model';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, ActivityFeedComponent, QuickStatsComponent],
  templateUrl: './overview.component.html',
})
export class OverviewComponent implements OnInit {
  private playerService = inject(PlayerService);
  private gameService = inject(GameService);
  private sessionService = inject(SessionService);

  today = new Date();

  players = signal<Player[]>([]);
  duels = signal<Game[]>([]);
  sessions = signal<Session[]>([]);
  loading = signal(true);

  get totalPlayers() {
    return this.players().length;
  }
  get ongoingDuels() {
    return this.duels().filter((d) => d.status === 'ONGOING').length;
  }
  get activeSession() {
    return this.sessions().find((s) => s.status === 'ACTIVE');
  }
  get registeredCount() {
    return this.activeSession?.registrations?.length ?? 0;
  }
  get recentDuels() {
    return this.duels().slice(0, 5);
  }
  get topPlayers() {
    return [...this.players()].sort((a, b) => b.elo - a.elo).slice(0, 5);
  }

  get statsItems() {
    return [
      { icon: '👥', label: 'Joueurs total',        value: this.totalPlayers,        color: 'neon'   as const },
      { icon: '✅', label: "Inscrits aujourd'hui", value: this.registeredCount,     color: 'green'  as const },
      { icon: '⚔️', label: 'Duels du jour',        value: this.recentDuels.length,  color: 'purple' as const },
      { icon: '🔥', label: 'En cours',             value: this.ongoingDuels,        color: 'orange' as const },
    ];
  }

  ngOnInit(): void {
    this.loading.set(true);

    forkJoin([
      this.playerService.getAll(),
      this.gameService.getAll(),
      this.sessionService.getAll(),
    ]).subscribe(([players, games, sessions]) => {
      this.players.set(players);
      this.duels.set(games);
      this.sessions.set(sessions);
      this.loading.set(false);
    });
  }
}
