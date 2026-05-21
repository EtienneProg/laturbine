import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Duel } from '../../../../core/models/duel.model';

@Component({
  selector: 'app-duel-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './duel-card.component.html',
})
export class DuelCardComponent {

  @Input() duel!: Duel;
  @Output() setResult = new EventEmitter<{ duelId: number; winnerTeamId: number }>();

  onWinner(teamId: number): void {
    this.setResult.emit({ duelId: this.duel.id, winnerTeamId: teamId });
  }

  isWinner(teamIndex: number): boolean {
    return this.duel.winnerTeamId === this.duel.teams[teamIndex].id;
  }
}
