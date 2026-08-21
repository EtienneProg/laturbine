import { Module } from '@nestjs/common';
import { AchievementsModule } from '../achievements/achievements.module';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [PublicController],
  providers: [PublicService],
  imports: [PrismaModule, AchievementsModule],
})
export class PublicModule {}
