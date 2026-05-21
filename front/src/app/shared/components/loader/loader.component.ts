import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center" [class]="fullPage ? 'py-16' : 'py-4'">
      <div class="rounded-full animate-spin border-t-transparent"
           [class]="size === 'sm'
             ? 'w-5 h-5 border-2 border-neon'
             : 'w-8 h-8 border-2 border-neon'">
      </div>
    </div>
  `,
})
export class LoaderComponent {
  @Input() fullPage = true;
  @Input() size: 'sm' | 'md' = 'md';
}
