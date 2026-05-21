import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LeaderboardService } from '../../core/services/leaderboard.service';
import { Player } from '../../core/models/player.model';
import { LeaderboardRowComponent } from './components/leaderboard-row/leaderboard-row.component';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LeaderboardRowComponent],
  templateUrl: './leaderboard.component.html',
})
export class LeaderboardComponent implements OnInit, OnDestroy {
  private leaderboardService = inject(LeaderboardService);
  private sub!: Subscription;

  players    = signal<Player[]>([]);
  search     = signal('');
  loading    = signal(true);
  lastUpdate = signal<Date | null>(null);

  filtered = computed(() => {
    const q = this.search().toLowerCase();
    return this.players().filter(p =>
      p.name.toLowerCase().includes(q)
    );
  });

  get top3() { return this.players().slice(0, 3); }

  ngOnInit(): void {
    this.sub = this.leaderboardService.getLive().subscribe(players => {
      this.players.set(players);
      this.lastUpdate.set(new Date());
      this.loading.set(false);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
