import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'ACTIVE' | 'OPEN' | 'CLOSED' | 'ONGOING' | 'FINISHED';;

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="px-3 py-1 rounded-full text-xs font-body" [class]="classes">
      {{ label }}
    </span>
  `,
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'OPEN';

  variantMap: Record<BadgeVariant, { label: string; classes: string }> = {
    ACTIVE:   { label: '🟢 Active',    classes: 'bg-green/20  text-green  border border-green/40'  },
    OPEN:     { label: '🔵 Ouverte',   classes: 'bg-neon/20   text-neon   border border-neon/40'   },
    CLOSED:   { label: '⚫ Terminée',  classes: 'bg-muted/20  text-muted  border border-muted/40'  },
    ONGOING:  { label: '🔥 En cours',  classes: 'bg-orange/20 text-orange border border-orange/40' },
    FINISHED: { label: '✅ Terminé',   classes: 'bg-muted/20  text-muted  border border-muted/40'  },
  };

  get label():   string { return this.variantMap[this.variant].label;   }
  get classes(): string { return this.variantMap[this.variant].classes; }
}
