import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ModalColor = 'neon' | 'green' | 'purple' | 'danger';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
})
export class ModalComponent {
  @Input() title = '';
  @Input() color: ModalColor = 'neon';
  @Output() close = new EventEmitter<void>();

  titleClasses: Record<ModalColor, string> = {
    neon:   'text-neon   drop-shadow-[0_0_12px_rgba(0,245,255,0.5)]',
    green:  'text-green  drop-shadow-[0_0_12px_rgba(0,255,136,0.4)]',
    purple: 'text-purple drop-shadow-[0_0_12px_rgba(191,95,255,0.4)]',
    danger: 'text-danger',
  };

  borderClasses: Record<ModalColor, string> = {
    neon:   'border-neon/30   shadow-[0_0_40px_rgba(0,245,255,0.1)]',
    green:  'border-green/30  shadow-[0_0_40px_rgba(0,255,136,0.1)]',
    purple: 'border-purple/30 shadow-[0_0_40px_rgba(191,95,255,0.1)]',
    danger: 'border-danger/30 shadow-[0_0_40px_rgba(255,59,92,0.1)]',
  };

  get titleClass():  string { return this.titleClasses[this.color];  }
  get borderClass(): string { return this.borderClasses[this.color]; }
}
