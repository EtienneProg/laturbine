import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Session } from '../../../../core/models/session.model';

@Component({
  selector: 'app-session-card',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './session-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionCardComponent {
  @Input() session!: Session;
  @Output() activate = new EventEmitter<Session>();
  @Output() close = new EventEmitter<Session>();
  @Output() delete = new EventEmitter<Session>();
  @Output() viewRegistrations = new EventEmitter<Session>();
  @Output() manualRegister = new EventEmitter<Session>();

  get borderClass(): string {
    return this.session.status === 'ACTIVE'
      ? 'border-green/40 shadow-[0_0_20px_rgba(0,255,136,0.08)]'
      : this.session.status === 'OPEN'
        ? 'border-neon/30'
        : 'border-border';
  }

  get statusLabel(): string {
    return this.session.status === 'ACTIVE'
      ? '🟢 Active'
      : this.session.status === 'OPEN'
        ? '🔵 Ouverte'
        : '⚫ Terminée';
  }

  get statusClass(): string {
    return this.session.status === 'ACTIVE'
      ? 'bg-green/20 text-green border border-green/40'
      : this.session.status === 'OPEN'
        ? 'bg-neon/20 text-neon border border-neon/40'
        : 'bg-muted/20 text-muted border border-muted/40';
  }
}
