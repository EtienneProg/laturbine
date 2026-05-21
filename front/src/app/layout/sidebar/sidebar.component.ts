import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive } from '@angular/router';

export interface NavItem {
  path:  string;
  label: string;
  icon:  string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  navItems: NavItem[] = [
    { path: '/overview',    label: 'Vue d\'ensemble',  icon: '⚡' },
    { path: '/games',       label: 'Jeux',             icon: '🎮' },
    { path: '/players',     label: 'Joueurs',          icon: '👥' },
    { path: '/sessions',    label: 'Sessions',         icon: '📅' },
    { path: '/leaderboard', label: 'Leaderboard',      icon: '🏆' },
  ];
}
