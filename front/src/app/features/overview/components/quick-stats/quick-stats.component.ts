import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StatItem {
  icon: string;
  label: string;
  value: number | string;
  color: 'neon' | 'green' | 'purple' | 'orange';
}

@Component({
  selector: 'app-quick-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-stats.component.html',
})
export class QuickStatsComponent {
  @Input() stats: StatItem[] = [];

  colorClasses: Record<StatItem['color'], { card: string; value: string }> = {
    neon:   { card: 'hover:border-neon/40 hover:shadow-neon',         value: 'text-neon drop-shadow-[0_0_10px_rgba(0,245,255,0.4)]'   },
    green:  { card: 'hover:border-green/40 hover:shadow-neon-green',  value: 'text-green drop-shadow-[0_0_10px_rgba(0,255,136,0.4)]'  },
    purple: { card: 'hover:border-purple/40 hover:shadow-neon-purple',value: 'text-purple drop-shadow-[0_0_10px_rgba(191,95,255,0.4)]'},
    orange: { card: 'hover:border-orange/40',                         value: 'text-orange'                                            },
  };

  getCardClass(color: StatItem['color']): string {
    return this.colorClasses[color].card;
  }

  getValueClass(color: StatItem['color']): string {
    return this.colorClasses[color].value;
  }
}
