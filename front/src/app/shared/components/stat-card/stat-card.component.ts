import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatCardColor = 'neon' | 'green' | 'purple' | 'orange';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html',
})
export class StatCardComponent {
  @Input() icon  = '';
  @Input() label = '';
  @Input() value: number | string = 0;
  @Input() color: StatCardColor = 'neon';

  valueClasses: Record<StatCardColor, string> = {
    neon:   'text-neon   drop-shadow-[0_0_10px_rgba(0,245,255,0.4)]',
    green:  'text-green  drop-shadow-[0_0_10px_rgba(0,255,136,0.4)]',
    purple: 'text-purple drop-shadow-[0_0_10px_rgba(191,95,255,0.4)]',
    orange: 'text-orange',
  };

  hoverClasses: Record<StatCardColor, string> = {
    neon:   'hover:border-neon/40   hover:shadow-neon',
    green:  'hover:border-green/40  hover:shadow-neon-green',
    purple: 'hover:border-purple/40 hover:shadow-neon-purple',
    orange: 'hover:border-orange/40',
  };

  get valueClass()  { return this.valueClasses[this.color]; }
  get hoverClass()  { return this.hoverClasses[this.color]; }
}
