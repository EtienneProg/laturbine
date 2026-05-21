import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastVariant = 'success' | 'error' | 'info';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
})
export class ToastComponent implements OnInit {
  @Input() message = '';
  @Input() variant: ToastVariant = 'success';
  @Input() duration = 3000;
  @Output() dismissed = new EventEmitter<void>();

  visible = true;

  variantClasses: Record<ToastVariant, string> = {
    success: 'border-green/40  bg-green/10  text-green',
    error:   'border-danger/40 bg-danger/10 text-danger',
    info:    'border-neon/40   bg-neon/10   text-neon',
  };

  icons: Record<ToastVariant, string> = {
    success: '✅',
    error:   '❌',
    info:    'ℹ️',
  };

  get classes(): string { return this.variantClasses[this.variant]; }
  get icon():    string { return this.icons[this.variant]; }

  ngOnInit(): void {
    setTimeout(() => {
      this.visible = false;
      this.dismissed.emit();
    }, this.duration);
  }
}
