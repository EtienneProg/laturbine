import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlayerService } from '../../core/services/player.service';
import { Player } from '../../core/models/player.model';
import { PlayerTableComponent } from './components/player-table/player-table.component';
import { PlayerFormComponent } from './components/player-form/player-form.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PlayerTableComponent,
    PlayerFormComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './players.component.html',
})
export class PlayersComponent implements OnInit {
  private playerService = inject(PlayerService);
  private router = inject(Router);

  players = signal<Player[]>([]);
  playerToDelete = signal<Player | null>(null);
  search = signal('');
  showForm = signal(false);
  editPlayer = signal<Player | null>(null);
  loading = signal(true);

  filtered = computed(() => {
    const q = this.search().toLowerCase();
    return this.players().filter(
      (p) => p.name.toLowerCase().includes(q) || p.discordTag.toLowerCase().includes(q),
    );
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.playerService.getAll().subscribe((p) => {
      this.players.set(p);
      this.loading.set(false);
    });
  }

  openCreate(): void {
    this.editPlayer.set(null);
    this.showForm.set(true);
  }

  openEdit(player: Player): void {
    this.editPlayer.set(player);
    this.showForm.set(true);
  }

  onSave(data: Partial<Player>): void {
    const edit = this.editPlayer();
    if (edit) {
      this.playerService.update(edit.id, data).subscribe((updated) => {
        this.players.update((list) => list.map((p) => (p.id === updated.id ? updated : p)));
        this.showForm.set(false);
      });
    } else {
      this.playerService.create(data).subscribe((created) => {
        this.players.update((list) => [created, ...list]);
        this.showForm.set(false);
      });
    }
  }

  onDeleteRequest(player: Player): void {
    this.playerToDelete.set(player);
  }

  onDeleteConfirm(): void {
    const player = this.playerToDelete();
    if (!player) return;
    this.playerService.delete(player.id).subscribe(() => {
      this.players.update((list) => list.filter((p) => p.id !== player.id));
      this.playerToDelete.set(null);
    });
  }

  onViewDetail(player: Player): void {
    this.router.navigate(['/players', player.id]);
  }
}
