import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { GameStatus, SessionStatus } from '@prisma/client';
import { DiscordService } from '../discord/discord.service';

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    private discord: DiscordService,
  ) {}

  async findAll() {
    return this.prisma.session.findMany({
      orderBy: { date: 'desc' },
      include: {
        registrations: {
          include: { player: { select: { id: true, name: true } } },
        },
      },
    });
  }

  async findOne(id: number) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: {
        registrations: {
          include: { player: { select: { id: true, name: true } } },
        },
        games: true,
      },
    });

    if (!session) throw new NotFoundException(`Session #${id} introuvable`);
    return session;
  }

  async create(dto: CreateSessionDto) {
    return this.prisma.session.create({
      data: { date: dto.date },
      include: { registrations: true },
    });
  }

  async activate(id: number) {
    await this.findOne(id);

    // Vérifie si une session active existe déjà
    const currentActive = await this.prisma.session.findFirst({
      where: { status: SessionStatus.ACTIVE },
      include: {
        games: {
          where: { status: GameStatus.ONGOING },
        },
      },
    });

    if (currentActive) {
      // Bloque si des duels sont en cours
      if (currentActive.games.length > 0) {
        throw new BadRequestException(
          `Impossible de clôturer la session du ${currentActive.date} : ${currentActive.games.length} duel(s) en cours`,
        );
      }

      // Clôture la session active
      await this.prisma.session.update({
        where: { id: currentActive.id },
        data: { status: SessionStatus.CLOSED },
      });
    }

    return this.prisma.session.update({
      where: { id },
      data: { status: SessionStatus.ACTIVE },
      include: { registrations: true },
    });
  }

  async close(id: number) {
    await this.findOne(id);
    return this.prisma.session.update({
      where: { id },
      data: { status: SessionStatus.CLOSED },
      include: { registrations: true },
    });
  }

  async delete(id: number) {
    await this.findOne(id);
    return this.prisma.session.delete({ where: { id } });
  }

  async getRegistrations(sessionId: number) {
    await this.findOne(sessionId);
    return this.prisma.registration.findMany({
      where: { sessionId },
      include: {
        player: { select: { id: true, name: true, discordTag: true } },
      },
      orderBy: { registeredAt: 'asc' },
    });
  }

  async registerPlayerByDiscordId(
    sessionId: number,
    discordId: string,
    discordTag: string,
    displayName: string,
    avatarUrl: string | null,
  ) {
    let player = await this.prisma.player.findUnique({ where: { discordId } });

    if (!player) {
      // Création
      player = await this.prisma.player.create({
        data: { discordId, discordTag, name: displayName, avatarUrl },
      });
    } else {
      // Mise à jour du profil à chaque inscription
      player = await this.prisma.player.update({
        where: { discordId },
        data: { discordTag, name: displayName, avatarUrl, isActive: true },
      });
    }

    return this.registerPlayer(sessionId, player.id);
  }

  async unregisterPlayerByDiscordId(sessionId: number, discordId: string) {
    const player = await this.prisma.player.findUnique({
      where: { discordId },
    });

    if (!player)
      throw new NotFoundException(
        `Joueur avec Discord ID ${discordId} introuvable`,
      );
    return this.unregisterPlayer(sessionId, player.id);
  }

  async registerPlayer(
    sessionId: number,
    playerId: number,
    skipDiscord = true,
  ) {
    const session = await this.findOne(sessionId);

    if (session.status === SessionStatus.CLOSED) {
      throw new BadRequestException('Cette session est clôturée');
    }

    // Réactive le joueur quel que soit le chemin d'inscription
    // (bot Discord OU inscription manuelle admin par playerId)
    await this.prisma.player.update({
      where: { id: playerId },
      data: { isActive: true },
    });

    const result = await this.prisma.registration.upsert({
      where: { playerId_sessionId: { playerId, sessionId } },
      create: { playerId, sessionId },
      update: {},
    });

    // Met à jour Discord seulement si pas appelé depuis le bot
    if (!skipDiscord) {
      this.discord.updateSessionMessage(sessionId).catch(() => {});
    }

    return result;
  }

  async unregisterPlayer(sessionId: number, playerId: number) {
    await this.findOne(sessionId);
    return this.prisma.registration.delete({
      where: { playerId_sessionId: { playerId, sessionId } },
    });
  }
}
