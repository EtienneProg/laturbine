import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerService } from '../../../../core/services/player.service';
import { PlayerStats } from '../../../../core/models/player.model';
import {FormsModule} from '@angular/forms';
import {PlayerAchievementsComponent} from '../player-achievements/player-achievements.component';
import {AchievementService} from '../../../../core/services/achievement.service';
import {Achievement} from '../../../../core/models/achievement.model';

@Component({
  selector: 'app-player-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, PlayerAchievementsComponent],
  templateUrl: './player-detail.component.html',
})
export class PlayerDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private playerService = inject(PlayerService);
  private achievementService  = inject(AchievementService);

  player = signal<PlayerStats | null>(null);
  achievements = signal<Achievement[]>([]);
  loading = signal(true);
  showEloEdit = signal(false);
  newElo = signal(0);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.playerService.getById(id).subscribe((p) => {
      this.player.set(p);
      this.loading.set(false);
    });
    this.achievementService.getPlayerAchievements(id).subscribe(a => {
      this.achievements.set(a);
    });
  }

  get winRate(): string {
    const p = this.player();
    if (!p) return '—';
    const total = p.wins + p.losses;
    return total === 0 ? '—' : `${Math.round((p.wins / total) * 100)}%`;
  }

  openEloEdit(): void {
    this.newElo.set(this.player()!.elo);
    this.showEloEdit.set(true);
  }

  saveElo(): void {
    const p = this.player();
    if (!p) return;
    this.playerService.update(p.id, { elo: this.newElo() }).subscribe((updated) => {
      this.player.set({ ...p, ...updated });
      this.showEloEdit.set(false);
    });
  }

  onIncrementAchievement(key: string): void {
    const p = this.player();
    if (!p) return;
    this.achievementService.manualIncrement(p.id, key).subscribe(() => {
      this.achievementService.getPlayerAchievements(p.id).subscribe(a => {
        this.achievements.set(a);
      });
    });
  }

  onUnlockAchievement(key: string): void {
    const p = this.player();
    if (!p) return;
    this.achievementService.manualUnlock(p.id, key).subscribe(() => {
      this.achievementService.getPlayerAchievements(p.id).subscribe(a => {
        this.achievements.set(a);
      });
    });
  }

  goBack(): void {
    this.router.navigate(['/players']);
  }
}
