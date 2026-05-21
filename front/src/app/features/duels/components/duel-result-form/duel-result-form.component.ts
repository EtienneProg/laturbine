import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Duel } from '../../../../core/models/duel.model';

@Component({
  selector: 'app-duel-result-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './duel-result-form.component.html',
})
export class DuelResultFormComponent {
  @Input() duel!: Duel;
  @Output() confirm = new EventEmitter<{ duelId: number; winnerTeamId: number }>();
  @Output() cancel  = new EventEmitter<void>();

  selected = signal<number | null>(null);

  select(teamId: number): void {
    this.selected.set(teamId);
  }

  onConfirm(): void {
    if (this.selected() === null) return;
    this.confirm.emit({
      duelId: this.duel.id,
      winnerTeamId: this.selected()!,
    });
  }
}
