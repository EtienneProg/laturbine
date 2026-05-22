import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DuelService } from '../../core/services/duel.service';
import { SessionService } from '../../core/services/session.service';
import { DiscordService } from '../../core/services/discord.service';
import { Duel, CreateDuelPayload } from '../../core/models/duel.model';
import { Session } from '../../core/models/session.model';
import { DuelCardComponent } from './components/duel-card/duel-card.component';
import { DuelCreateModalComponent } from './components/duel-create-modal/duel-create-modal.component';

@Component({
  selector: 'app-duels',
  standalone: true,
  imports: [CommonModule, DuelCardComponent, DuelCreateModalComponent],
  templateUrl: './duels.component.html',
})
export class DuelsComponent implements OnInit {
  private duelService    = inject(DuelService);
  private sessionService = inject(SessionService);
  private discordService = inject(DiscordService);

  duels          = signal<Duel[]>([]);
  activeSession  = signal<Session | null>(null);
  showModal      = signal(false);
  loading        = signal(true);
  creating       = signal(false);
  settingResult  = signal<number | null>(null); // stocke l'id du duel en cours de traitement


  get ongoingDuels()  { return this.duels().filter(d => d.status === 'ONGOING'); }
  get finishedDuels() { return this.duels().filter(d => d.status === 'FINISHED'); }

  ngOnInit(): void {
    this.sessionService.getAll().subscribe(sessions => {
      const active = sessions.find(s => s.status === 'ACTIVE') ?? null;
      this.activeSession.set(active);

      if (active) {
        this.duelService.getBySession(active.id).subscribe({
          next: (d) => {
            this.duels.set(d);
            this.loading.set(false);
          },
          error: () => {
            // Pas de duels pour cette session → tableau vide
            this.duels.set([]);
            this.loading.set(false);
          }
        });
      } else {
        this.loading.set(false);
      }
    });
  }

  onCreateDuel(payload: CreateDuelPayload): void {
    if (this.creating()) return;
    this.creating.set(true);

    this.duelService.create(payload).subscribe({
      next: (duel) => {
        this.duels.update(d => [duel, ...d]);
        this.discordService.announceDuel(duel.id).subscribe();
        this.showModal.set(false);
        this.creating.set(false);
      },
      error: () => {
        this.creating.set(false);
      }
    });

  }

  onSetResult(event: { duelId: number; winnerTeamId: number }): void {
    if (this.settingResult() !== null) return;
    this.settingResult.set(event.duelId);

    this.duelService.setResult(event.duelId, { winnerTeamId: event.winnerTeamId })
      .subscribe({
        next: (updated) => {
          this.duels.update(list =>
            list.map(d => d.id === updated.id ? updated : d)
          );
          this.discordService.announceResult(event.duelId).subscribe();
          this.settingResult.set(null);
        },
        error: () => {
          this.settingResult.set(null);
        }
      });

  }
}
