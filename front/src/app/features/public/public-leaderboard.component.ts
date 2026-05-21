import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, timer } from 'rxjs';
import { LeaderboardService } from '../../core/services/leaderboard.service';
import { AchievementService } from '../../core/services/achievement.service';
import { ApiService } from '../../core/services/api.service';
import { Player } from '../../core/models/player.model';
import { Game } from '../../core/models/game.model';
import { LbPlayerRowComponent } from './components/lb-player-row/lb-player-row.component';
import { LbEmptyRowComponent } from './components/lb-empty-row/lb-empty-row.component';
import { LbDuelSlotComponent, DuelSlotData } from './components/lb-duel-slot/lb-duel-slot.component';

interface DuelSlot extends DuelSlotData {
  game: Game;
}

interface Grade {
  key:       string;
  name:      string;
  icon:      string;
  threshold: number;
}

@Component({
  selector: 'app-public-leaderboard',
  standalone: true,
  imports: [
    CommonModule,
    LbPlayerRowComponent,
    LbEmptyRowComponent,
    LbDuelSlotComponent,
  ],
  templateUrl: './public-leaderboard.component.html',
  styles: [`
    :host { font-family: 'Orbitron', sans-serif; display: block; }
    .neon-frame {
      box-shadow: 0 0 20px rgba(168,85,247,.6), inset 0 0 20px rgba(168,85,247,.3);
    }
  `]
})
export class PublicLeaderboardComponent implements OnInit, OnDestroy {
  private leaderboardService = inject(LeaderboardService);
  private achievementService = inject(AchievementService);
  private api                = inject(ApiService);

  private pollSub!:    Subscription;
  private refreshSub!: Subscription;

  players     = signal<Player[]>([]);
  duelSlots   = signal<DuelSlot[]>([]);
  grades      = signal<Grade[]>([]);
  lastMatches = signal<Record<number, { opponents: string[]; win: boolean }>>({});
  scanTrigger = signal(0);

  private lastFinishedGameId = 0;
  private pendingRefresh     = false;

  get top10(): Player[] { return this.players().slice(0, 10); }

  get emptyRanks(): number[] {
    const filled = this.top10.length;
    return Array.from({ length: Math.max(0, 10 - filled) }, (_, i) => filled + i + 1);
  }

  ngOnInit(): void {
    this.achievementService.getGrades().subscribe(g => this.grades.set(g));
    this.loadAll();

    // Polling toutes les 5s pour détecter fin de duel
    this.pollSub = timer(5000, 5000).subscribe(() => this.checkForNewFinishedGame());

    // Refresh complet toutes les 60s
    this.refreshSub = timer(60000, 60000).subscribe(() => this.loadAll());
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
    this.refreshSub?.unsubscribe();
  }

  private loadAll(): void {
    this.loadLeaderboard();
    this.loadGames();
  }

  private loadLeaderboard(): void {
    this.leaderboardService.get().subscribe(p => this.players.set(p));
  }

  private loadGames(): void {
    this.api.get<Game[]>('/public/games/recent').subscribe(games => {
      this.duelSlots.set(this.buildSlots(games));
    });
    this.api.get<Record<number, { opponents: string[]; win: boolean }>>('/public/games/last-match')
      .subscribe(lm => this.lastMatches.set(lm));
  }

  private checkForNewFinishedGame(): void {
    if (this.pendingRefresh) return;

    this.api.get<Game[]>('/public/games/recent').subscribe(games => {
      const latestFinished = games.find(g => g.status === 'FINISHED');
      if (!latestFinished) return;

      if (this.lastFinishedGameId !== 0 && latestFinished.id !== this.lastFinishedGameId) {
        this.pendingRefresh = true;
        console.log('🎮 Nouveau duel terminé — refresh dans 20s');

        setTimeout(() => {
          this.scanTrigger.update(v => v + 1);
          setTimeout(() => {
            this.loadAll();
            this.pendingRefresh = false;
          }, 1300);
        }, 20000);
      }

      this.lastFinishedGameId = latestFinished.id;
      this.duelSlots.set(this.buildSlots(games));
    });
  }

  private buildSlots(games: Game[]): DuelSlot[] {
    const slots: DuelSlot[] = [];
    let usedSlots = 0;

    for (const game of games) {
      if (usedSlots >= 6) break;

      const team1Players = game.teams.find(t => t.name === 'Équipe 1')?.players ?? [];
      const team2Players = game.teams.find(t => t.name === 'Équipe 2')?.players ?? [];
      const size = team1Players.length;

      let needed = 1;
      if (size > 1) needed++;
      if (size > 3) needed++;

      if (usedSlots + needed > 6) break;

      const winnerTeam = game.winnerTeamId
        ? game.teams.find(t => t.id === game.winnerTeamId)
        : null;

      slots.push({
        game,
        slots:   needed,
        ongoing: game.status === 'ONGOING',
        team1:   team1Players.map(tp => ({
          name:   tp.player.name,
          avatar: tp.player.avatarUrl,
          win:    winnerTeam?.name === 'Équipe 1',
        })),
        team2:   team2Players.map(tp => ({
          name:   tp.player.name,
          avatar: tp.player.avatarUrl,
          win:    winnerTeam?.name === 'Équipe 2',
        })),
      });

      usedSlots += needed;
    }
    return slots;
  }

  getGrade(elo: number): string {
    const sorted = [...this.grades()].sort((a, b) => b.threshold - a.threshold);
    const grade  = sorted.find(g => elo >= g.threshold);
    const name   = grade?.name.replace('Grade ', '') ?? 'Bronze';
    const icon   = grade?.icon ?? '🥉';
    return `${icon} ${name}`;
  }

  getLastMatch(playerId: number): string {
    const match = this.lastMatches()[playerId];
    if (!match || match.opponents.length === 0) return '';
    const names = match.opponents.join(', ');
    return `${names.length > 20 ? names.slice(0, 20) + '...' : names} ${match.win ? '🏆' : '❌'}`;
  }
}
