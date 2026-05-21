import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Achievement } from '../models/achievement.model';

@Injectable({ providedIn: 'root' })
export class AchievementService {
  private api = inject(ApiService);

  getPlayerAchievements(playerId: number): Observable<Achievement[]> {
    return this.api.get<Achievement[]>(`/achievements/player/${playerId}`);
  }

  manualIncrement(playerId: number, key: string): Observable<void> {
    return this.api.post<void>(`/achievements/player/${playerId}/increment`, { key });
  }

  manualUnlock(playerId: number, key: string): Observable<void> {
    return this.api.post<void>(`/achievements/player/${playerId}/unlock`, { key });
  }

  getGrades(): Observable<{ key: string; name: string; icon: string; threshold: number }[]> {
    return this.api.get('/achievements/grades');
  }
}
