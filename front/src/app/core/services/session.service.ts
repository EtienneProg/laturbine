import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Session, Registration } from '../models/session.model';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private api = inject(ApiService);

  getAll(): Observable<Session[]> {
    return this.api.get<Session[]>('/sessions');
  }

  getById(id: number): Observable<Session> {
    return this.api.get<Session>(`/sessions/${id}`);
  }

  create(date: string): Observable<Session> {
    return this.api.post<Session>('/sessions', { date });
  }

  activate(id: number): Observable<Session> {
    return this.api.put<Session>(`/sessions/${id}/activate`, {});
  }

  close(id: number): Observable<Session> {
    return this.api.put<Session>(`/sessions/${id}/close`, {});
  }

  getRegistrations(sessionId: number): Observable<Registration[]> {
    return this.api.get<Registration[]>(`/sessions/${sessionId}/registrations`);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/sessions/${id}`);
  }

  registerPlayer(sessionId: number, playerId: number): Observable<any> {
    return this.api.post(`/sessions/${sessionId}/register/${playerId}`, {});
  }
}
