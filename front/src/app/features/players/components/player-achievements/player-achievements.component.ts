import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Achievement, AchievementCategory } from '../../../../core/models/achievement.model';

interface AchievementGroup {
  category: AchievementCategory;
  label:    string;
  icon:     string;
  items:    Achievement[];
}

@Component({
  selector: 'app-player-achievements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-achievements.component.html',
})
export class PlayerAchievementsComponent {
  @Input() achievements: Achievement[] = [];
  @Input() playerId!: number;
  @Output() increment = new EventEmitter<string>(); // key
  @Output() unlock    = new EventEmitter<string>(); // key

  activeCategory = signal<AchievementCategory | 'ALL'>('ALL');

  categoryMeta: Record<AchievementCategory, { label: string; icon: string }> = {
    GRADE:        { label: 'Grades',       icon: '🏅' },
    DUEL:         { label: 'Duel',         icon: '⚔️' },
    VAMPIRE:      { label: 'Vampire',      icon: '🧛' },
    HUNGER_GAMES: { label: 'Hunger Games', icon: '🏹' },
    SPECIAL:      { label: 'Spéciaux',     icon: '⭐' },
  };

  get groups(): AchievementGroup[] {
    const categories: AchievementCategory[] = ['GRADE', 'DUEL', 'VAMPIRE', 'HUNGER_GAMES', 'SPECIAL'];
    return categories.map(cat => ({
      category: cat,
      label:    this.categoryMeta[cat].label,
      icon:     this.categoryMeta[cat].icon,
      items:    this.achievements.filter(a => a.category === cat),
    })).filter(g => g.items.length > 0);
  }

  get filtered(): AchievementGroup[] {
    const cat = this.activeCategory();
    if (cat === 'ALL') return this.groups;
    return this.groups.filter(g => g.category === cat);
  }

  get unlockedCount(): number {
    return this.achievements.filter(a => a.unlocked).length;
  }

  getProgressPercent(a: Achievement): number {
    if (!a.threshold) return a.unlocked ? 100 : 0;
    return Math.min(100, Math.round((a.progress / a.threshold) * 100));
  }

  getProgressLabel(a: Achievement): string {
    if (!a.threshold) return a.unlocked ? 'Débloqué' : 'Non débloqué';
    return `${a.progress} / ${a.threshold}`;
  }
}
