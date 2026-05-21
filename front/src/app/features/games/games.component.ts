import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../core/services/game.service';
import { SessionService } from '../../core/services/session.service';
import { DiscordService } from '../../core/services/discord.service';
import { Game, GameMode, CreateGamePayload, SetResultDuelPayload, SetResultVampirePayload, SetResultHungerGamesPayload } from '../../core/models/game.model';
import { Session } from '../../core/models/session.model';
import { GameCardComponent } from './components/game-card/game-card.component';
import { GameCreateModalComponent } from './components/game-create-modal/game-create-modal.component';
import { GameResultModalComponent } from './components/game-result-modal/game-result-modal.component';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, GameCardComponent, GameCreateModalComponent, GameResultModalComponent],
  templateUrl: './games.component.html',
})
export class GamesComponent implements OnInit {
  private gameService    = inject(GameService);
  private sessionService = inject(SessionService);
  private discordService = inject(DiscordService);

  games         = signal<Game[]>([]);
  gameModes     = signal<GameMode[]>([]);
  activeSession = signal<Session | null>(null);
  showCreate    = signal(false);
  gameToResult  = signal<Game | null>(null);
  loading       = signal(true);

  get ongoingGames()  { return this.games().filter(g => g.status === 'ONGOING');  }
  get finishedGames() { return this.games().filter(g => g.status === 'FINISHED'); }

  ngOnInit(): void {
    this.gameService.getModes().subscribe(m => this.gameModes.set(m));

    this.sessionService.getAll().subscribe(sessions => {
      const active = sessions.find(s => s.status === 'ACTIVE') ?? null;
      this.activeSession.set(active);
      if (active) {
        this.gameService.getBySession(active.id).subscribe(g => {
          this.games.set(g);
          this.loading.set(false);
        });
      } else {
        this.loading.set(false);
      }
    });
  }

  onCreate(payload: CreateGamePayload): void {
    this.gameService.create(payload).subscribe(game => {
      this.games.update(g => [game, ...g]);
      this.discordService.announceDuel(game.id).subscribe();
      this.showCreate.set(false);
    });
  }

  onSetResult(game: Game): void {
    this.gameToResult.set(game);
  }

  onResultDuel(payload: SetResultDuelPayload): void {
    const game = this.gameToResult();
    if (!game) return;
    this.gameService.setResultDuel(game.id, payload).subscribe(updated => {
      this.games.update(list => list.map(g => g.id === updated.id ? updated : g));
      this.discordService.announceResult(game.id).subscribe();
      this.gameToResult.set(null);
    });
  }

  onResultVampire(payload: SetResultVampirePayload): void {
    const game = this.gameToResult();
    if (!game) return;
    this.gameService.setResultVampire(game.id, payload).subscribe(updated => {
      this.games.update(list => list.map(g => g.id === updated.id ? updated : g));
      this.gameToResult.set(null);
    });
  }

  onResultHungerGames(payload: SetResultHungerGamesPayload): void {
    const game = this.gameToResult();
    if (!game) return;
    this.gameService.setResultHungerGames(game.id, payload).subscribe(updated => {
      this.games.update(list => list.map(g => g.id === updated.id ? updated : g));
      this.gameToResult.set(null);
    });
  }
}
