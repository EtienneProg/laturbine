import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Registration } from '../../../../core/models/session.model';
import { CreateDuelPayload } from '../../../../core/models/duel.model';

@Component({
  selector: 'app-duel-create-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './duel-create-modal.component.html',
})
export class DuelCreateModalComponent {
  @Input() sessionId!: number;
  @Input() registrations: Registration[] = [];
  @Output() close  = new EventEmitter<void>();
  @Output() create = new EventEmitter<CreateDuelPayload>();

  teamSize  = signal(1);
  team1Ids  = signal<number[]>([]);
  team2Ids  = signal<number[]>([]);
  creating  = signal(false);


  sizes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  canCreate = computed(() =>
    this.creating() &&
    this.team1Ids().length === this.teamSize() &&
    this.team2Ids().length === this.teamSize()
  );

  setTeamSize(n: number): void {
    this.teamSize.set(n);
    this.team1Ids.set([]);
    this.team2Ids.set([]);
  }

  toggle(team: 1 | 2, playerId: number): void {
    const current = team === 1 ? this.team1Ids() : this.team2Ids();
    const other   = team === 1 ? this.team2Ids() : this.team1Ids();
    const setter  = team === 1
      ? (v: number[]) => this.team1Ids.set(v)
      : (v: number[]) => this.team2Ids.set(v);

    if (other.includes(playerId)) return;
    if (current.includes(playerId)) {
      setter(current.filter(id => id !== playerId));
    } else if (current.length < this.teamSize()) {
      setter([...current, playerId]);
    }
  }

  isInTeam(team: 1 | 2, playerId: number): boolean {
    return (team === 1 ? this.team1Ids() : this.team2Ids()).includes(playerId);
  }

  isInOtherTeam(team: 1 | 2, playerId: number): boolean {
    return (team === 1 ? this.team2Ids() : this.team1Ids()).includes(playerId);
  }

  onSubmit(): void {
    if (!this.canCreate()) return;
    this.creating.set(true);
    this.create.emit({
      sessionId: this.sessionId,
      teamSize: this.teamSize(),
      team1PlayerIds: this.team1Ids(),
      team2PlayerIds: this.team2Ids(),
    });
  }
}
