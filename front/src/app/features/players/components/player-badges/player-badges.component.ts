import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Badge } from '../../../../core/models/badge.model';

@Component({
  selector: 'app-player-badges',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-badges.component.html',
})
export class PlayerBadgesComponent {
  @Input() badges: Badge[] = [];
}
