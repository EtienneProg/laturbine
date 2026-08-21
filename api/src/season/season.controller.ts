import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { SeasonService } from './season.service';
import { JwtGuard } from '../auth/jwt.guard';

@UseGuards(JwtGuard)
@Controller('seasons')
export class SeasonController {
  constructor(private seasonService: SeasonService) {}

  @Get('active')
  getActive() {
    return this.seasonService.getActiveSeason();
  }

  @Get('history')
  getHistory() {
    return this.seasonService.getSeasonHistory();
  }

  @Post('close-and-start')
  closeAndStart(@Body('label') label?: string) {
    return this.seasonService.closeSeasonAndStartNew(label);
  }
}
