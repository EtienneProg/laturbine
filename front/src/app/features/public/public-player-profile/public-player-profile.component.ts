import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { LeaderboardService } from '../../../core/services/leaderboard.service';
import { Player } from '../../../core/models/player.model';

interface PublicAchievement {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  threshold: number | null;
  progress: number;
  unlockedAt: string | Date | null;
  unlocked: boolean;
}

interface PublicBadge {
  key: string;
  name: string;
  description: string;
  icon: string;
  seasonNumber: number | null;
  awardedAt: string | Date;
}

export interface PublicPlayerProfile {
  id: number;
  name: string;
  discordTag: string;
  avatarUrl: string | null;
  elo: number;
  wins: number;
  losses: number;
  rank: number;
  winRate: number;
  achievements: PublicAchievement[];
  badges: PublicBadge[];
}

interface AchievementGroup {
  category: string;
  label: string;
  icon: string;
  items: PublicAchievement[];
}

const CATEGORY_META: Record<string, { label: string; icon: string }> = {
  GRADE:        { label: 'Grades',        icon: '🎖️' },
  DUEL:         { label: 'Duel',          icon: '⚔️' },
  VAMPIRE:      { label: 'Vampire',       icon: '🧛' },
  HUNGER_GAMES: { label: 'Hunger Games',  icon: '🏹' },
  SPECIAL:      { label: 'Spécial',       icon: '✨' },
};

@Component({
  selector: 'app-public-player-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './public-player-profile.component.html',
  styles: [
    `
      .player-nav-scroll {
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 245, 255, 0.35) transparent;
      }
      .player-nav-scroll::-webkit-scrollbar {
        width: 6px;
      }
      .player-nav-scroll::-webkit-scrollbar-track {
        background: transparent;
      }
      .player-nav-scroll::-webkit-scrollbar-thumb {
        background-color: rgba(0, 245, 255, 0.35);
        border-radius: 999px;
      }
      .player-nav-scroll::-webkit-scrollbar-thumb:hover {
        background-color: rgba(0, 245, 255, 0.55);
      }
    `,
  ],
})
export class PublicPlayerProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private leaderboardService = inject(LeaderboardService);

  loading  = signal(true);
  notFound = signal(false);
  profile  = signal<PublicPlayerProfile | null>(null);
  allPlayers = signal<Player[]>([]);
  navOpen = signal(false);
  activeCategory = signal<string>('ALL');
  activeTab = signal<'achievements' | 'badges'>('achievements');
  search = signal('');

  filteredPlayers = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.allPlayers();
    return this.allPlayers().filter((p) => p.name.toLowerCase().includes(q));
  });

  currentId = computed(() => this.profile()?.id ?? null);

  groups = computed<AchievementGroup[]>(() => {
    const p = this.profile();
    if (!p) return [];

    const byCategory = new Map<string, PublicAchievement[]>();
    for (const a of p.achievements) {
      const list = byCategory.get(a.category) ?? [];
      list.push(a);
      byCategory.set(a.category, list);
    }

    return Array.from(byCategory.entries()).map(([category, items]) => ({
      category,
      label: CATEGORY_META[category]?.label ?? category,
      icon:  CATEGORY_META[category]?.icon ?? '🏆',
      items,
    }));
  });

  filteredGroups = computed(() => {
    const cat = this.activeCategory();

    if (cat === 'ALL') return this.groups();

    if (cat === 'UNLOCKED') {
      return this.groups()
        .map((g) => ({ ...g, items: g.items.filter((a) => a.unlocked) }))
        .filter((g) => g.items.length > 0);
    }

    return this.groups().filter((g) => g.category === cat);
  });

  unlockedCount = computed(() => this.profile()?.achievements.filter((a) => a.unlocked).length ?? 0);
  totalCount    = computed(() => this.profile()?.achievements.length ?? 0);

  ngOnInit(): void {
    this.leaderboardService.get().subscribe((players) => this.allPlayers.set(players));

    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (!id) return;
      this.loadProfile(id);
    });
  }

  private loadProfile(id: number): void {
    this.loading.set(true);
    this.notFound.set(false);
    this.navOpen.set(false);

    this.api.get<PublicPlayerProfile>(`/public/players/${id}`).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.activeCategory.set('ALL');
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  goToPlayer(id: number): void {
    this.router.navigate(['/public/players', id]);
  }

  getProgressPercent(a: PublicAchievement): number {
    if (!a.threshold) return 0;
    return Math.min(100, Math.round((a.progress / a.threshold) * 100));
  }

  getProgressLabel(a: PublicAchievement): string {
    if (!a.threshold) return '';
    return `${a.progress} / ${a.threshold}`;
  }
}
