import { Module } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './achievements.controller';
import { AchievementsPublicController } from './achievements.public.controller';
import { DiscordModule } from '../discord/discord.module';

@Module({
  controllers: [AchievementsController, AchievementsPublicController],
  providers: [AchievementsService],
  exports: [AchievementsService],
  imports: [DiscordModule],
})
export class AchievementsModule {}
