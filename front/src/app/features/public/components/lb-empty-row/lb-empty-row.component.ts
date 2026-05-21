
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: '[app-lb-empty-row]',
  host: { class: 'w-full' },
  standalone: true,
  imports: [CommonModule],
  template: `
      <td class="w-[60px] text-center text-cyan-300 text-2xl font-bold py-2 rounded-l-2xl">
        {{ rank }}
      </td>
      <td class="py-2">
        <div class="flex items-center gap-4">
          <span class="h-14 aspect-square rounded-full border-2 border-cyan-400/70"></span>
          <span class="italic text-purple-300">— emplacement libre —</span>
        </div>
      </td>
      <td></td>
      <td></td>
      <td class="w-[160px] text-right text-purple-400 text-3xl font-bold py-2 rounded-r-2xl pr-6">—</td>
  `,
  styles: [`
    .empty {
      opacity: .35;
      border-style: dashed;
    }
  `]
})
export class LbEmptyRowComponent {
  @Input() rank!: number;
}
