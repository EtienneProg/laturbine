import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive } from '@angular/router';
import { SeasonSwitchComponent } from '../../features/season/season.component';

export interface NavItem {
  path:  string;
  label: string;
  icon:  string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive, SeasonSwitchComponent],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  navItems: NavItem[] = [
    { path: '/admin/overview', label: "Vue d'ensemble", icon: '⚡' },
    { path: '/admin/games', label: 'Jeux', icon: '🎮' },
    { path: '/admin/players', label: 'Joueurs', icon: '👥' },
    { path: '/admin/sessions', label: 'Sessions', icon: '📅' },
    { path: '/admin/leaderboard', label: 'Leaderboard', icon: '🏆' },
  ];
}
