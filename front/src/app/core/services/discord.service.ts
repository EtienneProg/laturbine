import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class DiscordService {
  private api = inject(ApiService);

  // Annonce la création d'une session dans le channel public
  announceSession(sessionId: number): Observable<void> {
    console.log(`Announcing session ${sessionId}`);
    return this.api.post<void>(`/discord/announce-session/${sessionId}`, {});
  }

  // Annonce le lancement d'un duel
  announceDuel(duelId: number): Observable<void> {
    return this.api.post<void>(`/discord/announce-duel/${duelId}`, {});
  }

  // Annonce les résultats + nouveaux ELOs
  announceResult(duelId: number): Observable<void> {
    return this.api.post<void>(`/discord/announce-result/${duelId}`, {});
  }
}
