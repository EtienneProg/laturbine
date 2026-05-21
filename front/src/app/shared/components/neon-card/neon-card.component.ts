import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type NeonCardColor = 'default' | 'neon' | 'green' | 'purple' | 'orange' | 'danger';

@Component({
  selector: 'app-neon-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './neon-card.component.html',
})
export class NeonCardComponent {
  @Input() color: NeonCardColor = 'default';
  @Input() hover = true;

  borderClasses: Record<NeonCardColor, string> = {
    default: 'border-border',
    neon:    'border-neon/40   shadow-[0_0_20px_rgba(0,245,255,0.08)]',
    green:   'border-green/40  shadow-[0_0_20px_rgba(0,255,136,0.08)]',
    purple:  'border-purple/40 shadow-[0_0_20px_rgba(191,95,255,0.08)]',
    orange:  'border-orange/40',
    danger:  'border-danger/40',
  };

  hoverClasses: Record<NeonCardColor, string> = {
    default: 'hover:border-white/10',
    neon:    'hover:border-neon/60   hover:shadow-neon',
    green:   'hover:border-green/60  hover:shadow-neon-green',
    purple:  'hover:border-purple/60 hover:shadow-neon-purple',
    orange:  'hover:border-orange/60',
    danger:  'hover:border-danger/60',
  };

  get classes(): string {
    return `bg-card border rounded-2xl transition-all
            ${this.borderClasses[this.color]}
            ${this.hover ? this.hoverClasses[this.color] : ''}`;
  }
}
