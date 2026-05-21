import { Component, Input, Output, EventEmitter, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerService } from '../../../../core/services/player.service';
import { Player } from '../../../../core/models/player.model';
import { Registration } from '../../../../core/models/session.model';

@Component({
  selector: 'app-manual-register-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manual-register-modal.component.html',
})
export class ManualRegisterModalComponent implements OnInit {
  @Input() registrations: Registration[] = [];
  @Output() confirm = new EventEmitter<number[]>(); // playerIds à inscrire
  @Output() close   = new EventEmitter<void>();

  private playerService = inject(PlayerService);

  allPlayers  = signal<Player[]>([]);
  search      = signal('');
  selected    = signal<number[]>([]);

  // Joueurs non encore inscrits
  available = computed(() => {
    const registeredIds = this.registrations.map(r => r.playerId);
    const q = this.search().toLowerCase();
    return this.allPlayers()
      .filter(p => !registeredIds.includes(p.id))
      .filter(p => p.name.toLowerCase().includes(q) || p.discordTag.toLowerCase().includes(q));
  });

  ngOnInit(): void {
    this.playerService.getAll().subscribe(p => this.allPlayers.set(p));
  }

  toggle(playerId: number): void {
    const current = this.selected();
    if (current.includes(playerId)) {
      this.selected.set(current.filter(id => id !== playerId));
    } else {
      this.selected.set([...current, playerId]);
    }
  }

  isSelected(playerId: number): boolean {
    return this.selected().includes(playerId);
  }

  selectAll(): void {
    this.selected.set(this.available().map(p => p.id));
  }

  clearAll(): void {
    this.selected.set([]);
  }

  onConfirm(): void {
    if (this.selected().length === 0) return;
    this.confirm.emit(this.selected());
  }
}
