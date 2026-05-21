import { Component, Input, Output, EventEmitter, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Game } from '../../../../core/models/game.model';
import { SetResultDuelPayload, SetResultVampirePayload, SetResultHungerGamesPayload } from '../../../../core/models/game.model';
import { SessionService } from '../../../../core/services/session.service';
import { Player } from '../../../../core/models/player.model';

@Component({
  selector: 'app-game-result-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-result-modal.component.html',
})
export class GameResultModalComponent implements OnInit {
  @Input() game!: Game;
  @Output() close             = new EventEmitter<void>();
  @Output() resultDuel        = new EventEmitter<SetResultDuelPayload>();
  @Output() resultVampire     = new EventEmitter<SetResultVampirePayload>();
  @Output() resultHungerGames = new EventEmitter<SetResultHungerGamesPayload>();

  private sessionService = inject(SessionService);

  // DUEL
  selectedWinnerTeamId = signal<number | null>(null);

  // VAMPIRE
  vampireWinner        = signal<'vampires' | 'villagers' | null>(null);
  survivingVillagerIds = signal<number[]>([]);

  // HUNGER GAMES
  sessionPlayers       = signal<{ id: number; name: string }[]>([]);
  winnerPlayerIds      = signal<number[]>([]);
  lastManStanding      = signal(false);

  get mode(): string { return this.game.gameMode.key; }

  get vampireTeam() { return this.game.teams.find(t => t.name === 'Vampires'); }
  get villagerTeam() { return this.game.teams.find(t => t.name === 'Villageois'); }

  ngOnInit(): void {
    // Pour HungerGames → charge les inscrits de la session
    if (this.mode === 'HUNGER_GAMES') {
      this.sessionService.getById(this.game.sessionId).subscribe(session => {
        this.sessionPlayers.set(
          session.registrations.map(r => ({ id: r.playerId, name: r.player.name }))
        );
      });
    }

    // Initialise les villageois tous cochés par défaut
    if (this.mode === 'VAMPIRE') {
      const ids = this.villagerTeam?.players.map(tp => tp.player.id) ?? [];
      this.survivingVillagerIds.set(ids);
    }
  }

  // VAMPIRE helpers
  toggleVillager(playerId: number): void {
    const current = this.survivingVillagerIds();
    if (current.includes(playerId)) {
      this.survivingVillagerIds.set(current.filter(id => id !== playerId));
    } else {
      this.survivingVillagerIds.set([...current, playerId]);
    }
  }

  isVillagerSurviving(playerId: number): boolean {
    return this.survivingVillagerIds().includes(playerId);
  }

  // HUNGER GAMES helpers
  toggleWinner(playerId: number): void {
    const current = this.winnerPlayerIds();
    if (current.includes(playerId)) {
      this.winnerPlayerIds.set(current.filter(id => id !== playerId));
    } else {
      this.winnerPlayerIds.set([...current, playerId]);
    }
  }

  isWinner(playerId: number): boolean {
    return this.winnerPlayerIds().includes(playerId);
  }

  canConfirm = computed(() => {
    if (this.mode === 'DUEL')         return this.selectedWinnerTeamId() !== null;
    if (this.mode === 'VAMPIRE')      return this.vampireWinner() !== null;
    if (this.mode === 'HUNGER_GAMES') return this.winnerPlayerIds().length > 0;
    return false;
  });

  onConfirm(): void {
    if (this.mode === 'DUEL') {
      this.resultDuel.emit({ winnerTeamId: this.selectedWinnerTeamId()! });
    } else if (this.mode === 'VAMPIRE') {
      this.resultVampire.emit({
        winner:               this.vampireWinner()!,
        survivingVillagerIds: this.vampireWinner() === 'villagers'
          ? this.survivingVillagerIds()
          : [],
      });
    } else if (this.mode === 'HUNGER_GAMES') {
      this.resultHungerGames.emit({
        winnerPlayerIds: this.winnerPlayerIds(),
        lastManStanding: this.lastManStanding(),
      });
    }
  }
}
