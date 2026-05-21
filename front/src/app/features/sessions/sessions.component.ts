import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../core/services/session.service';
import { DiscordService } from '../../core/services/discord.service';
import { Session, SessionStatus } from '../../core/models/session.model';
import { SessionCardComponent } from './components/session-card/session-card.component';
import { SessionFormComponent } from './components/session-form/session-form.component';
import { RegistrationsListComponent } from './components/registrations-list/registrations-list.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { forkJoin } from 'rxjs';
import { ManualRegisterModalComponent } from './components/manual-register-modal/manual-register-modal.component';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [
    CommonModule,
    SessionCardComponent,
    SessionFormComponent,
    RegistrationsListComponent,
    ConfirmDialogComponent,
    ManualRegisterModalComponent,
  ],
  templateUrl: './sessions.component.html',
})
export class SessionsComponent implements OnInit {
  private sessionService = inject(SessionService);
  private discordService = inject(DiscordService);

  sessions = signal<Session[]>([]);
  showForm = signal(false);
  showManualRegister = signal(false);
  selectedSession = signal<Session | null>(null);
  sessionToDelete = signal<Session | null>(null);
  loading = signal(true);
  selectedSessionForRegister = signal<Session | null>(null);


  get activeSession() {
    return this.sessions().find((s) => s.status === 'ACTIVE');
  }
  get openSessions() {
    return this.sessions().filter((s) => s.status === 'OPEN');
  }
  get closedSessions() {
    return this.sessions().filter((s) => s.status === 'CLOSED');
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.sessionService.getAll().subscribe((s) => {
      this.sessions.set(s);
      this.loading.set(false);
    });
  }

  onCreate(date: string): void {
    this.sessionService.create(date).subscribe((session) => {
      this.sessions.update((list) => [session, ...list]);
      this.discordService.announceSession(session.id).subscribe();
      this.showForm.set(false);
    });
  }

  onActivate(session: Session): void {
    this.sessionService.activate(session.id).subscribe({
      next: (updated) => {
        this.sessions.update(list => list.map(s =>
          s.id === updated.id ? updated :
            s.status === 'ACTIVE' ? { ...s, status: 'CLOSED' as SessionStatus } : s
        ));
      },
      error: (err) => {
        alert(err.error?.message ?? 'Impossible d\'activer cette session');
      }
    });
  }

  onClose(session: Session): void {
    this.sessionService.close(session.id).subscribe((updated) => {
      this.sessions.update((list) => list.map((s) => (s.id === updated.id ? updated : s)));
    });
  }

  // Ouvre la popup de confirmation
  onDeleteRequest(session: Session): void {
    this.sessionToDelete.set(session);
  }

  // Confirme la suppression
  onDeleteConfirm(): void {
    const session = this.sessionToDelete();
    if (!session) return;

    this.sessionService.delete(session.id).subscribe(() => {
      this.sessions.update((list) => list.filter((s) => s.id !== session.id));
      this.sessionToDelete.set(null);
    });
  }

  // Annule la suppression
  onDeleteCancel(): void {
    this.sessionToDelete.set(null);
  }

  viewRegistrations(session: Session): void {
    this.selectedSession.set(session);
  }

  onManualRegisterRequest(session: Session): void {
    this.selectedSessionForRegister.set(session);
    this.showManualRegister.set(true);
  }

  onManualRegister(playerIds: number[]): void {
    const session = this.selectedSessionForRegister();
    if (!session) return;

    const requests = playerIds.map(playerId =>
      this.sessionService.registerPlayer(session.id, playerId)
    );

    forkJoin(requests).subscribe(() => {
      this.showManualRegister.set(false);
      this.load();
    });
  }
}
