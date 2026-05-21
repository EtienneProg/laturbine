export type AchievementCategory = 'GRADE' | 'DUEL' | 'VAMPIRE' | 'HUNGER_GAMES' | 'SPECIAL';

export interface Achievement {
  id:          number;
  key:         string;
  name:        string;
  description: string;
  icon:        string;
  category:    AchievementCategory;
  threshold:   number | null;
  isAuto:      boolean;
  progress:    number;
  unlockedAt:  Date | null;
  unlocked:    boolean;
}
