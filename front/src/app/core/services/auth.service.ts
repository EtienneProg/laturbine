import { Injectable, signal } from '@angular/core';

const TOKEN_KEY = 'lt_admin_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _isAuthenticated = signal<boolean>(!!localStorage.getItem(TOKEN_KEY));

  isAuthenticated(): boolean {
    return this._isAuthenticated();
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this._isAuthenticated.set(true);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._isAuthenticated.set(false);
  }
}
