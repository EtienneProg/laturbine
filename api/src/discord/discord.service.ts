import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Achievement } from '@prisma/client';

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  // ─────────────────────────────────────────
  // Gestion des messages actifs
  // ─────────────────────────────────────────

  async getActiveMessages() {
    return this.prisma.discordMessage.findMany();
  }

  async saveMessage(
    type: string,
    refId: number,
    messageId: string,
    channelId: string,
  ) {
    return this.prisma.discordMessage.upsert({
      where: { type_refId: { type, refId } },
      create: { type, refId, messageId, channelId },
      update: { messageId, channelId },
    });
  }

  async deleteMessage(type: string, refId: number) {
    return this.prisma.discordMessage.deleteMany({
      where: { type, refId },
    });
  }

  // ─────────────────────────────────────────
  // Appel vers le bot Discord
  // ─────────────────────────────────────────

  private async callBot(
    path: string,
    method = 'POST',
    body?: unknown,
  ): Promise<void> {
    const botUrl =
      this.config.get<string>('BOT_URL') ?? 'http://localhost:3001';
    const token = this.config.get<string>('BOT_API_TOKEN') ?? '';
    try {
      const res = await fetch(`${botUrl}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        const text = await res.text();
        this.logger.error(`Bot call failed ${path}: ${res.status} ${text}`);
      }
    } catch (err) {
      this.logger.error(`Bot unreachable ${path}:`, err);
    }
  }

  async announceSession(sessionId: number): Promise<void> {
    await this.callBot(`/announce-session/${sessionId}`);
  }

  async updateSessionMessage(sessionId: number): Promise<void> {
    await this.callBot(`/update-session/${sessionId}`, 'PUT');
  }

  async announceDuel(duelId: number): Promise<void> {
    await this.callBot(`/announce-duel/${duelId}`);
  }

  async announceResult(duelId: number): Promise<void> {
    await this.callBot(`/announce-result/${duelId}`);
  }

  async announceVampireResult(gameId: number): Promise<void> {
    await this.callBot(`/announce-result/vampire/${gameId}`);
  }

  async announceHungerGamesResult(gameId: number): Promise<void> {
    await this.callBot(`/announce-result/hunger-games/${gameId}`);
  }

  async deleteSessionMessage(sessionId: number): Promise<void> {
    await this.callBot(`/delete-message/session/${sessionId}`, 'DELETE');
  }

  async deleteDuelMessage(duelId: number): Promise<void> {
    await this.callBot(`/delete-message/duel/${duelId}`, 'DELETE');
  }

  // ─────────────────────────────────────────
  // Annonce achievement débloqué
  // On envoie directement les données nécessaires (nom du joueur +
  // infos de l'achievement) pour que le bot n'ait pas besoin de
  // rappeler l'API.
  // ─────────────────────────────────────────
  async announceAchievementUnlocked(
    playerId: number,
    achievement: Achievement,
  ): Promise<void> {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
    });
    if (!player) return;

    await this.callBot('/announce-achievement', 'POST', {
      playerName: player.name,
      achievement: {
        key: achievement.key,
        name: achievement.name,
        icon: achievement.icon,
        category: achievement.category,
      },
    });
  }
}
