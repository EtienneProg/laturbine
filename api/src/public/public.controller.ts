import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AchievementsService } from '../achievements/achievements.service';

@Controller('public')
export class PublicController {
  constructor(
    private prisma: PrismaService,
    private achievementsService: AchievementsService,
  ) {}

  @Get('players/:id')
  async getPublicProfile(@Param('id') id: string) {
    const playerId = Number(id);

    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
    });
    if (!player) throw new NotFoundException('Joueur introuvable');

    const higherEloCount = await this.prisma.player.count({
      where: { elo: { gt: player.elo } },
    });

    const total = player.wins + player.losses;
    const winRate = total === 0 ? 0 : Math.round((player.wins / total) * 100);

    // Réutilise la méthode existante — renvoie TOUS les achievements
    // (débloqués + verrouillés) avec leur progression
    const achievements =
      await this.achievementsService.getPlayerAchievements(playerId);

    const playerBadges = await this.prisma.playerBadge.findMany({
      where: { playerId },
      include: { badge: { include: { season: true } } },
      orderBy: { awardedAt: 'desc' },
    });

    return {
      id: player.id,
      name: player.name,
      discordTag: player.discordTag,
      avatarUrl: player.avatarUrl,
      elo: player.elo,
      wins: player.wins,
      losses: player.losses,
      rank: higherEloCount + 1,
      winRate,
      achievements: achievements.map((a) => ({
        key: a.key,
        name: a.name,
        description: a.description,
        icon: a.icon,
        category: a.category,
        threshold: a.threshold,
        progress: a.progress,
        unlockedAt: a.unlockedAt,
        unlocked: a.unlocked,
      })),
      badges: playerBadges.map((pb) => ({
        key: pb.badge.key,
        name: pb.badge.name,
        description: pb.badge.description,
        icon: pb.badge.icon,
        seasonNumber: pb.badge.season?.number ?? null,
        awardedAt: pb.awardedAt,
      })),
    };
  }
}
