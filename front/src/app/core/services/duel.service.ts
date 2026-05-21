import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Duel, CreateDuelPayload, DuelResultPayload } from '../models/duel.model';

@Injectable({ providedIn: 'root' })
export class DuelService {
  private api = inject(ApiService);

  getAll(): Observable<Duel[]> {
    return this.api.get<Duel[]>('/duels');
  }

  getBySession(sessionId: number): Observable<Duel[]> {
    return this.api.get<Duel[]>(`/sessions/${sessionId}/duels`);
  }

  create(payload: CreateDuelPayload): Observable<Duel> {
    return this.api.post<Duel>('/duels', payload);
  }

  setResult(duelId: number, payload: DuelResultPayload): Observable<Duel> {
    return this.api.put<Duel>(`/duels/${duelId}/result`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/duels/${id}`);
  }
}
