import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'public/leaderboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent),
  },

  // ─────────────────────────────────────────
  // Public — pas d'authGuard
  // ─────────────────────────────────────────
  {
    path: 'public/leaderboard',
    loadComponent: () => import('./features/public/public-leaderboard/public-leaderboard.component')
      .then(m => m.PublicLeaderboardComponent),
  },
  {
    path: 'public/players/:id',
    loadComponent: () => import('./features/public/public-player-profile/public-player-profile.component')
      .then(m => m.PublicPlayerProfileComponent),
  },

  // ─────────────────────────────────────────
  // Admin — protégé par authGuard
  // ─────────────────────────────────────────
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        loadComponent: () => import('./features/overview/overview.component')
          .then(m => m.OverviewComponent),
      },
      {
        path: 'games',
        loadComponent: () => import('./features/games/games.component')
          .then(m => m.GamesComponent),
      },
      {
        path: 'players',
        loadComponent: () => import('./features/players/players.component')
          .then(m => m.PlayersComponent),
      },
      {
        path: 'players/:id',
        loadComponent: () => import('./features/players/components/player-detail/player-detail.component')
          .then(m => m.PlayerDetailComponent),
      },
      {
        path: 'sessions',
        loadComponent: () => import('./features/sessions/sessions.component')
          .then(m => m.SessionsComponent),
      },
      {
        path: 'leaderboard',
        loadComponent: () => import('./features/leaderboard/leaderboard.component')
          .then(m => m.LeaderboardComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
