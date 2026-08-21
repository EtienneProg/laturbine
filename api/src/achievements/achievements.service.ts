import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DiscordService } from '../discord/discord.service';
import { Achievement } from '@prisma/client';

@Injectable()
export class AchievementsService {
  constructor(
    private prisma: PrismaService,
    private discordService: DiscordService,
  ) {}

  // ─────────────────────────────────────────
  // Récupère tous les achievements d'un joueur
  // avec progression et statut débloqué/non
  // ─────────────────────────────────────────
  async getPlayerAchievements(playerId: number) {
    const allAchievements = await this.prisma.achievement.findMany({
      orderBy: [{ category: 'asc' }, { threshold: 'asc' }],
    });

    const playerAchievements = await this.prisma.playerAchievement.findMany({
      where: { playerId },
    });

    const map = new Map(playerAchievements.map((pa) => [pa.achievementId, pa]));

    return allAchievements.map((a) => {
      const pa = map.get(a.id);
      return {
        ...a,
        progress: pa?.progress ?? 0,
        unlockedAt: pa?.unlockedAt ?? null,
        unlocked: !!pa?.unlockedAt,
      };
    });
  }

  // ─────────────────────────────────────────
  // Vérifie et débloque les achievements DUEL
  // Appelé après chaque fin de duel
  // ─────────────────────────────────────────
  async checkDuelAchievements(playerId: number) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
    });
    if (!player) return;

    const totalGames = player.wins + player.losses;

    // Victoires
    await this.checkThreshold(playerId, 'DUEL_WIN_3', player.wins);
    await this.checkThreshold(playerId, 'DUEL_WIN_10', player.wins);
    await this.checkThreshold(playerId, 'DUEL_WIN_30', player.wins);
    await this.checkThreshold(playerId, 'DUEL_WIN_100', player.wins);

    // Parties jouées
    await this.checkThreshold(playerId, 'DUEL_PLAYED_10', totalGames);
    await this.checkThreshold(playerId, 'DUEL_PLAYED_30', totalGames);
    await this.checkThreshold(playerId, 'DUEL_PLAYED_100', totalGames);

    // Grades ELO
    await this.checkEloGrades(playerId, player.elo);
  }

  // ─────────────────────────────────────────
  // Grades ELO
  // ─────────────────────────────────────────
  private async checkEloGrades(playerId: number, elo: number) {
    const grades = [
      { key: 'GRADE_BRONZE', threshold: 1200 },
      { key: 'GRADE_ARGENT', threshold: 1350 },
      { key: 'GRADE_OR', threshold: 1500 },
      { key: 'GRADE_DIAMANT', threshold: 1650 },
      { key: 'GRADE_PLATINE', threshold: 1750 },
      { key: 'GRADE_ELITE', threshold: 1850 },
      { key: 'GRADE_CHAMPION', threshold: 1950 },
      { key: 'GRADE_LEGENDE', threshold: 2100 },
    ];

    for (const grade of grades) {
      const achievement = await this.prisma.achievement.findUnique({
        where: { key: grade.key },
      });
      if (!achievement) continue;

      await this.upsertProgress(playerId, achievement.id, elo, grade.threshold);
    }
  }

  // ─────────────────────────────────────────
  // Vampire
  // ─────────────────────────────────────────
  async incrementVampireWin(playerId: number) {
    await this.increment(playerId, 'VAMPIRE_3');
    await this.increment(playerId, 'VAMPIRE_10');
    await this.increment(playerId, 'VAMPIRE_30');
  }

  async incrementSurvivorWin(playerId: number) {
    await this.increment(playerId, 'SURVIVOR_3');
    await this.increment(playerId, 'SURVIVOR_10');
    await this.increment(playerId, 'SURVIVOR_30');
  }

  // ─────────────────────────────────────────
  // HungerGames
  // ─────────────────────────────────────────
  async incrementHungerGamesWin(playerId: number) {
    await this.increment(playerId, 'HG_WIN_1');
    await this.increment(playerId, 'HG_WIN_3');
    await this.increment(playerId, 'HG_WIN_10');
  }

  // ─────────────────────────────────────────
  // Débloque un achievement one-shot (sans threshold)
  // ─────────────────────────────────────────
  async unlockAchievement(playerId: number, key: string) {
    const achievement = await this.prisma.achievement.findUnique({
      where: { key },
    });
    if (!achievement) return;

    const existing = await this.prisma.playerAchievement.findUnique({
      where: {
        playerId_achievementId: { playerId, achievementId: achievement.id },
      },
    });

    // Déjà débloqué → on ne touche à rien et on ne refire pas la commande
    if (existing?.unlockedAt) return;

    await this.prisma.playerAchievement.upsert({
      where: {
        playerId_achievementId: { playerId, achievementId: achievement.id },
      },
      create: {
        playerId,
        achievementId: achievement.id,
        progress: 1,
        unlockedAt: new Date(),
      },
      update: { unlockedAt: new Date() },
    });

    await this.onAchievementUnlocked(playerId, achievement);
  }

  // ─────────────────────────────────────────
  // Manuel — incrément depuis le dashboard
  // ─────────────────────────────────────────
  async manualIncrement(playerId: number, key: string) {
    await this.increment(playerId, key);
  }

  async manualUnlock(playerId: number, key: string) {
    await this.unlockAchievement(playerId, key);
  }

  // ─────────────────────────────────────────
  // Helpers privés
  // ─────────────────────────────────────────
  private async increment(playerId: number, key: string) {
    const achievement = await this.prisma.achievement.findUnique({
      where: { key },
    });
    if (!achievement) return;

    const current = await this.prisma.playerAchievement.upsert({
      where: {
        playerId_achievementId: { playerId, achievementId: achievement.id },
      },
      create: { playerId, achievementId: achievement.id, progress: 1 },
      update: { progress: { increment: 1 } },
    });

    const alreadyUnlocked = !!current.unlockedAt;

    // Débloque si threshold atteint ET pas déjà débloqué
    if (
      achievement.threshold !== null &&
      current.progress >= achievement.threshold &&
      !alreadyUnlocked
    ) {
      await this.prisma.playerAchievement.update({
        where: {
          playerId_achievementId: { playerId, achievementId: achievement.id },
        },
        data: { unlockedAt: new Date() },
      });

      // On ne passe ici QUE lors de la transition verrouillé → débloqué
      await this.onAchievementUnlocked(playerId, achievement);
    }
  }

  private async checkThreshold(
    playerId: number,
    key: string,
    currentValue: number,
  ) {
    const achievement = await this.prisma.achievement.findUnique({
      where: { key },
    });
    if (!achievement || achievement.threshold === null) return;

    await this.upsertProgress(
      playerId,
      achievement.id,
      currentValue,
      achievement.threshold,
    );
  }

  private async upsertProgress(
    playerId: number,
    achievementId: number,
    currentValue: number,
    threshold: number,
  ) {
    const existing = await this.prisma.playerAchievement.findUnique({
      where: { playerId_achievementId: { playerId, achievementId } },
    });

    const wasAlreadyUnlocked = !!existing?.unlockedAt;
    const shouldUnlock = currentValue >= threshold;
    const isNewlyUnlocked = shouldUnlock && !wasAlreadyUnlocked;

    await this.prisma.playerAchievement.upsert({
      where: { playerId_achievementId: { playerId, achievementId } },
      create: {
        playerId,
        achievementId,
        progress: currentValue,
        unlockedAt: shouldUnlock ? new Date() : null,
      },
      update: {
        progress: currentValue,
        unlockedAt: isNewlyUnlocked ? new Date() : existing?.unlockedAt,
      },
    });

    // On ne fire la commande QUE si on vient de passer de non-débloqué à débloqué,
    // que ce soit à la création de la ligne ou à sa mise à jour.
    if (isNewlyUnlocked) {
      const achievement = await this.prisma.achievement.findUnique({
        where: { id: achievementId },
      });
      if (achievement) {
        await this.onAchievementUnlocked(playerId, achievement);
      }
    }
  }

  // ─────────────────────────────────────────
  // Hook central — appelé UNE SEULE FOIS,
  // exactement au moment du déblocage.
  // ─────────────────────────────────────────
  private async onAchievementUnlocked(
    playerId: number,
    achievement: Achievement,
  ) {
    await this.discordService.announceAchievementUnlocked(
      playerId,
      achievement,
    );
  }

  async getGrades() {
    return this.prisma.achievement.findMany({
      where: { category: 'GRADE' },
      orderBy: { threshold: 'asc' },
      select: { key: true, name: true, icon: true, threshold: true },
    });
  }
}
