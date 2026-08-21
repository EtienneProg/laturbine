import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Badge } from '../models/badge.model';

@Injectable({ providedIn: 'root' })
export class BadgeService {
  private api = inject(ApiService);

  getPlayerBadges(playerId: number): Observable<Badge[]> {
    return this.api.get<Badge[]>(`/players/${playerId}/badges`);
  }
}
