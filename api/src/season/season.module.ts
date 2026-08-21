import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SeasonService } from './season.service';
import { SeasonController } from './season.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SeasonController],
  providers: [SeasonService],
  exports: [SeasonService],
})
export class SeasonModule {}
