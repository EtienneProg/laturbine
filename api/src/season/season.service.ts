import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DiscordService } from '../discord/discord.service';

@Injectable()
export class SeasonService {
  constructor(
    private prisma: PrismaService,
    private discordService: DiscordService,
  ) {}

  async getActiveSeason() {
    return this.prisma.season.findFirst({ where: { isActive: true } });
  }

  async getSeasonHistory() {
    return this.prisma.season.findMany({
      orderBy: { number: 'desc' },
      include: {
        playerStats: {
          orderBy: { finalElo: 'desc' },
          include: {
            player: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        badges: {
          include: {
            playerBadges: {
              include: {
                player: { select: { id: true, name: true, avatarUrl: true } },
              },
            },
          },
        },
      },
    });
  }

  // ─────────────────────────────────────────
  // Clôture la saison active (si elle existe) :
  //  - snapshot des stats clés par joueur (SeasonPlayerStats)
  //  - dump JSON players + achievements débloqués (rawExport)
  //  - attribue les badges de fin de saison aux joueurs ACTIFS
  //    (participation + top1/top3/top10 selon l'elo)
  //  - supprime TOUT l'historique de games et sessions (cascade
  //    → teams, teamPlayers, eloHistory disparaissent avec)
  //  - supprime les DiscordMessage trackés liés à ces sessions/duels
  //  - reset elo/wins/losses de tous les joueurs
  //  - reset TOUS les achievements (progress + unlockedAt)
  //  - repasse TOUS les joueurs en isActive = false
  // Puis crée et active la nouvelle saison.
  // Enfin (hors transaction), demande au bot de vider les channels Discord.
  // ─────────────────────────────────────────
  async closeSeasonAndStartNew(label?: string) {
    const newSeason = await this.prisma.$transaction(async (tx) => {
      const currentSeason = await tx.season.findFirst({
        where: { isActive: true },
      });

      const players = await tx.player.findMany({
        include: { achievements: { include: { achievement: true } } },
      });

      if (currentSeason) {
        // Snapshot des stats clés (table dédiée, facilement requêtable)
        const playerStatsData = players.map((p) => ({
          seasonId: currentSeason.id,
          playerId: p.id,
          finalElo: p.elo,
          wins: p.wins,
          losses: p.losses,
          achievementsUnlocked: p.achievements.filter((pa) => pa.unlockedAt)
            .length,
        }));

        if (playerStatsData.length > 0) {
          await tx.seasonPlayerStats.createMany({ data: playerStatsData });
        }

        // ─────────────────────────────────────────
        // Badges de fin de saison — uniquement pour les joueurs actifs
        // ─────────────────────────────────────────
        const activePlayers = players
          .filter((p) => p.isActive)
          .sort((a, b) => b.elo - a.elo);

        if (activePlayers.length > 0) {
          const seasonNumber = currentSeason.number;

          const participantBadge = await tx.badge.upsert({
            where: { key: `SEASON_${seasonNumber}_PARTICIPANT` },
            create: {
              key: `SEASON_${seasonNumber}_PARTICIPANT`,
              name: `Participant — Saison ${seasonNumber}`,
              description: `A participé activement à la saison ${seasonNumber}`,
              icon: '🎮',
              seasonId: currentSeason.id,
            },
            update: {},
          });

          await tx.playerBadge.createMany({
            data: activePlayers.map((p) => ({
              playerId: p.id,
              badgeId: participantBadge.id,
            })),
            skipDuplicates: true,
          });

          const podiumTiers: Array<{
            suffix: string;
            label: string;
            icon: string;
            count: number;
          }> = [
            { suffix: 'TOP10', label: 'Top 10', icon: '🔟', count: 10 },
            { suffix: 'TOP3', label: 'Top 3', icon: '🥉', count: 3 },
            { suffix: 'TOP1', label: 'Top 1', icon: '👑', count: 1 },
          ];

          for (const tier of podiumTiers) {
            const eligiblePlayers = activePlayers.slice(0, tier.count);
            if (eligiblePlayers.length === 0) continue;

            const badge = await tx.badge.upsert({
              where: { key: `SEASON_${seasonNumber}_${tier.suffix}` },
              create: {
                key: `SEASON_${seasonNumber}_${tier.suffix}`,
                name: `${tier.label} — Saison ${seasonNumber}`,
                description: `Classé ${tier.label} de la saison ${seasonNumber}`,
                icon: tier.icon,
                seasonId: currentSeason.id,
              },
              update: {},
            });

            await tx.playerBadge.createMany({
              data: eligiblePlayers.map((p) => ({
                playerId: p.id,
                badgeId: badge.id,
              })),
              skipDuplicates: true,
            });
          }
        }

        // Dump JSON brut : players + achievements débloqués
        const rawExport = {
          exportedAt: new Date().toISOString(),
          players: players.map((p) => ({
            id: p.id,
            name: p.name,
            discordTag: p.discordTag,
            elo: p.elo,
            wins: p.wins,
            losses: p.losses,
            isActive: p.isActive,
          })),
          achievements: players.map((p) => ({
            playerId: p.id,
            playerName: p.name,
            unlocked: p.achievements
              .filter((pa) => pa.unlockedAt)
              .map((pa) => ({
                key: pa.achievement.key,
                name: pa.achievement.name,
                category: pa.achievement.category,
                progress: pa.progress,
                unlockedAt: pa.unlockedAt,
              })),
          })),
        };

        await tx.season.update({
          where: { id: currentSeason.id },
          data: {
            isActive: false,
            endedAt: new Date(),
            rawExport,
          },
        });

        // ─────────────────────────────────────────
        // Supprime tout l'historique de games/sessions —
        // le cascade Prisma/Postgres nettoie automatiquement
        // Game → Team → TeamPlayer et Game → EloHistory
        // ─────────────────────────────────────────
        await tx.session.deleteMany({});

        // Les DiscordMessage ne sont pas liés par FK (juste un refId),
        // donc pas de cascade — on les nettoie explicitement
        await tx.discordMessage.deleteMany({
          where: { type: { in: ['session', 'duel'] } },
        });
      }

      // Reset ELO / wins / losses / statut actif pour tous les joueurs
      await tx.player.updateMany({
        data: { elo: 1000, wins: 0, losses: 0, isActive: false },
      });

      // Reset TOUS les achievements (y compris SPECIAL)
      await tx.playerAchievement.updateMany({
        data: { progress: 0, unlockedAt: null },
      });

      // Numéro de la prochaine saison
      const lastSeason = await tx.season.findFirst({
        orderBy: { number: 'desc' },
      });
      const nextNumber = (lastSeason?.number ?? 0) + 1;

      return tx.season.create({
        data: {
          number: nextNumber,
          label,
          isActive: true,
        },
      });
    });

    // Hors transaction : notifie le bot pour vider les channels Discord
    // (échec réseau ici ne doit pas annuler la clôture déjà commit en base)
    this.discordService.clearSeasonChannels().catch(() => {});

    return newSeason;
  }
}
