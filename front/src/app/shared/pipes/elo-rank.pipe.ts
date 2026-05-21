import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'eloRank',
  standalone: true,
})
export class EloRankPipe implements PipeTransform {
  transform(elo: number): string {
    if (elo >= 2000) return '👑 Légende';
    if (elo >= 1800) return '💎 Elite';
    if (elo >= 1650) return '🔥 Pro';
    if (elo >= 1500) return '⚡ Confirmé';
    if (elo >= 1350) return '🎯 Intermédiaire';
    return '🌱 Débutant';
  }
}
