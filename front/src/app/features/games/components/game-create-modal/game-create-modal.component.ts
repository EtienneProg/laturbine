import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameMode, CreateGamePayload } from '../../../../core/models/game.model';
import { Registration } from '../../../../core/models/session.model';

@Component({
  selector: 'app-game-create-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-create-modal.component.html',
})
export class GameCreateModalComponent {
  @Input() sessionId!: number;
  @Input() registrations: Registration[] = [];
  @Input() gameModes: GameMode[] = [];
  @Output() close  = new EventEmitter<void>();
  @Output() create = new EventEmitter<CreateGamePayload>();

  selectedMode  = signal<GameMode | null>(null);
  teamSelections = signal<number[][]>([]); // un tableau de playerIds par équipe
  search        = signal('');

  filteredPlayers = computed(() => {
    const q = this.search().toLowerCase();
    return this.registrations.filter(r =>
      r.player.name.toLowerCase().includes(q)
    );
  });

  selectMode(mode: GameMode): void {
    this.selectedMode.set(mode);
    // Initialise les équipes selon le mode
    this.teamSelections.set(mode.teamNames.map(() => []));
    this.search.set('');
  }

  togglePlayer(teamIndex: number, playerId: number): void {
    const teams = this.teamSelections().map(t => [...t]);
    const inOther = teams.some((t, i) => i !== teamIndex && t.includes(playerId));
    if (inOther) return;

    const idx = teams[teamIndex].indexOf(playerId);
    if (idx >= 0) {
      teams[teamIndex].splice(idx, 1);
    } else {
      teams[teamIndex].push(playerId);
    }
    this.teamSelections.set(teams);
  }

  isInTeam(teamIndex: number, playerId: number): boolean {
    return this.teamSelections()[teamIndex]?.includes(playerId) ?? false;
  }

  isInOtherTeam(teamIndex: number, playerId: number): boolean {
    return this.teamSelections().some((t, i) => i !== teamIndex && t.includes(playerId));
  }

  getTeamCount(teamIndex: number): number {
    return this.teamSelections()[teamIndex]?.length ?? 0;
  }

  canCreate = computed(() => {
    const mode = this.selectedMode();
    if (!mode) return false;
    if (!mode.hasTeams) return true;
    return this.teamSelections().every(t => t.length > 0);
  });

  onSubmit(): void {
    const mode = this.selectedMode();
    if (!mode || !this.canCreate()) return;

    this.create.emit({
      sessionId:  this.sessionId,
      gameModeId: mode.id,
      teams: mode.hasTeams
        ? this.teamSelections().map(playerIds => ({ playerIds }))
        : undefined,
    });
  }

  getTeamColor(i: number): string {
    const colors = ['text-neon', 'text-purple', 'text-orange', 'text-green'];
    return colors[i % colors.length];
  }

  getBorderColor(i: number): string {
    const colors = ['border-neon/30', 'border-purple/30', 'border-orange/30', 'border-green/30'];
    return colors[i % colors.length];
  }

  getBgSelected(i: number): string {
    const colors = ['bg-neon/10 border-l-neon', 'bg-purple/10 border-l-purple', 'bg-orange/10 border-l-orange', 'bg-green/10 border-l-green'];
    return colors[i % colors.length];
  }
}
