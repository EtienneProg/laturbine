import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';
import {ToastComponent} from '../toast/toast.component';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  template: `
    <div class="fixed top-6 right-6 z-50 flex flex-col gap-3">
      @for (toast of toastService.toasts(); track toast.id) {
        <app-toast
          [message]="toast.message"
          [variant]="toast.type"
          [duration]="4000"
          (dismissed)="toastService.dismiss(toast.id)"
        />
      }
    </div>
  `,
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
