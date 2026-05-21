import { Injectable, inject } from '@angular/core';
import { Observable, timer, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { Player } from '../models/player.model';

@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  private api = inject(ApiService);

  // Snapshot unique
  get(): Observable<Player[]> {
    return this.api.get<Player[]>('/leaderboard');
  }

  // Polling toutes les 30 secondes pour le temps réel
  getLive(): Observable<Player[]> {
    return timer(0, 30_000).pipe(
      switchMap(() => this.get())
    );
  }
}
