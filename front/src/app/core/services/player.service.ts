import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Player, PlayerStats } from '../models/player.model';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private api = inject(ApiService);

  getAll(): Observable<Player[]> {
    return this.api.get<Player[]>('/players');
  }

  getById(id: number): Observable<PlayerStats> {
    return this.api.get<PlayerStats>(`/players/${id}`);
  }

  create(data: Partial<Player>): Observable<Player> {
    return this.api.post<Player>('/players', data);
  }

  update(id: number, data: Partial<Player>): Observable<Player> {
    return this.api.put<Player>(`/players/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/players/${id}`);
  }
}
