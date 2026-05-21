import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  Game, GameMode, CreateGamePayload,
  SetResultDuelPayload, SetResultVampirePayload,
  SetResultHungerGamesPayload,
} from '../models/game.model';

@Injectable({ providedIn: 'root' })
export class GameService {
  private api = inject(ApiService);

  getModes(): Observable<GameMode[]> {
    return this.api.get<GameMode[]>('/games/modes');
  }

  getAll(): Observable<Game[]> {
    return this.api.get<Game[]>('/games');
  }

  getBySession(sessionId: number): Observable<Game[]> {
    return this.api.get<Game[]>(`/sessions/${sessionId}/duels`);
  }

  getById(id: number): Observable<Game> {
    return this.api.get<Game>(`/games/${id}`);
  }

  create(payload: CreateGamePayload): Observable<Game> {
    return this.api.post<Game>('/games', payload);
  }

  setResultDuel(gameId: number, payload: SetResultDuelPayload): Observable<Game> {
    return this.api.put<Game>(`/games/${gameId}/result/duel`, payload);
  }

  setResultVampire(gameId: number, payload: SetResultVampirePayload): Observable<Game> {
    return this.api.put<Game>(`/games/${gameId}/result/vampire`, payload);
  }

  setResultHungerGames(gameId: number, payload: SetResultHungerGamesPayload): Observable<Game> {
    return this.api.put<Game>(`/games/${gameId}/result/hunger-games`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/games/${id}`);
  }
}
