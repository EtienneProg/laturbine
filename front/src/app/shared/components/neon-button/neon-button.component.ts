import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type NeonButtonVariant = 'neon' | 'green' | 'purple' | 'orange' | 'danger';

@Component({
  selector: 'app-neon-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './neon-button.component.html',
})
export class NeonButtonComponent {
  @Input() variant: NeonButtonVariant = 'neon';
  @Input() disabled = false;
  @Input() loading  = false;
  @Output() clicked = new EventEmitter<void>();

  variantClasses: Record<NeonButtonVariant, string> = {
    neon:   'bg-neon/10   border-neon/60   text-neon   hover:bg-neon/20   hover:shadow-neon',
    green:  'bg-green/10  border-green/60  text-green  hover:bg-green/20  hover:shadow-neon-green',
    purple: 'bg-purple/10 border-purple/60 text-purple hover:bg-purple/20 hover:shadow-neon-purple',
    orange: 'bg-orange/10 border-orange/60 text-orange hover:bg-orange/20',
    danger: 'bg-danger/10 border-danger/60 text-danger hover:bg-danger/20',
  };

  get classes(): string {
    return `px-5 py-2.5 rounded-xl font-display text-xs tracking-widest
            border transition-all
            disabled:opacity-30 disabled:cursor-not-allowed
            ${this.variantClasses[this.variant]}`;
  }
}
