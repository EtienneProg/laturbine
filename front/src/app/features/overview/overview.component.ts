import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PlayerService } from '../../core/services/player.service';
import { DuelService } from '../../core/services/duel.service';
import { SessionService } from '../../core/services/session.service';
import { Player } from '../../core/models/player.model';
import { Duel } from '../../core/models/duel.model';
import { Session } from '../../core/models/session.model';
import { DatePipe } from '@angular/common';
import { ActivityFeedComponent } from './components/activity-feed/activity-feed.component';
import { QuickStatsComponent } from './components/quick-stats/quick-stats.component';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, ActivityFeedComponent, QuickStatsComponent],
  templateUrl: './overview.component.html',
})
export class OverviewComponent implements OnInit {
  private playerService = inject(PlayerService);
  private duelService = inject(DuelService);
  private sessionService = inject(SessionService);

  today = new Date();

  players = signal<Player[]>([]);
  duels = signal<Duel[]>([]);
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
    this.playerService.getAll().subscribe((p) => this.players.set(p));
    this.duelService.getAll().subscribe((d) => {
      this.duels.set(d);
      this.loading.set(false);
    });
    this.sessionService.getAll().subscribe((s) => this.sessions.set(s));
  }
}
