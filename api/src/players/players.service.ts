import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { AchievementsService } from '../achievements/achievements.service';

@Injectable()
export class PlayersService {
  constructor(
    private prisma: PrismaService,
    private achievements: AchievementsService,
  ) {}

  async findAll() {
    return this.prisma.player.findMany({
      orderBy: { elo: 'desc' },
    });
  }

  async findOne(id: number) {
    const player = await this.prisma.player.findUnique({
      where: { id },
      include: {
        eloHistory: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!player) throw new NotFoundException(`Joueur #${id} introuvable`);

    // Calcul du rang
    const rank = await this.prisma.player.count({
      where: { elo: { gt: player.elo } },
    });

    // Calcul winRate
    const total = player.wins + player.losses;
    const winRate = total === 0 ? 0 : Math.round((player.wins / total) * 100);

    return { ...player, rank: rank + 1, winRate };
  }

  async create(dto: CreatePlayerDto) {
    const existing = await this.prisma.player.findFirst({
      where: {
        OR: [
          { name: dto.name },
          ...(dto.discordId ? [{ discordId: dto.discordId }] : []),
        ],
      },
    });

    if (existing) {
      throw new ConflictException(
        'Un joueur avec ce nom ou Discord ID existe déjà',
      );
    }

    return this.prisma.player.create({
      data: {
        name: dto.name,
        discordId: dto.discordId ?? `manual_${Date.now()}`,
        discordTag: dto.discordTag ?? dto.name,
      },
    });
  }

  async update(id: number, dto: UpdatePlayerDto) {
    await this.findOne(id);
    const updated = this.prisma.player.update({
      where: { id },
      data: dto,
    });

    if (dto.elo !== undefined) {
      await this.achievements.checkDuelAchievements(id);
    }

    return updated;
  }

  async findProfileByDiscordId(discordId: string) {
    const player = await this.prisma.player.findUnique({
      where: { discordId },
      include: {
        achievements: {
          where: { unlockedAt: { not: null } },
          include: { achievement: true },
          orderBy: { unlockedAt: 'desc' },
        },
      },
    });

    if (!player)
      throw new NotFoundException(
        `Joueur avec Discord ID ${discordId} introuvable`,
      );

    const higherEloCount = await this.prisma.player.count({
      where: { elo: { gt: player.elo } },
    });

    const total = player.wins + player.losses;
    const winRate = total === 0 ? 0 : Math.round((player.wins / total) * 100);

    return {
      id: player.id,
      name: player.name,
      discordId: player.discordId,
      discordTag: player.discordTag,
      avatarUrl: player.avatarUrl,
      elo: player.elo,
      wins: player.wins,
      losses: player.losses,
      rank: higherEloCount + 1,
      winRate,
      achievements: player.achievements.map((pa) => ({
        key: pa.achievement.key,
        name: pa.achievement.name,
        icon: pa.achievement.icon,
      })),
    };
  }

  async delete(id: number) {
    await this.findOne(id);
    return this.prisma.player.delete({ where: { id } });
  }

  async getBadges(playerId: number) {
    const playerBadges = await this.prisma.playerBadge.findMany({
      where: { playerId },
      include: { badge: { include: { season: true } } },
      orderBy: { awardedAt: 'desc' },
    });

    return playerBadges.map((pb) => ({
      key: pb.badge.key,
      name: pb.badge.name,
      description: pb.badge.description,
      icon: pb.badge.icon,
      seasonNumber: pb.badge.season?.number ?? null,
      awardedAt: pb.awardedAt,
    }));
  }
}
