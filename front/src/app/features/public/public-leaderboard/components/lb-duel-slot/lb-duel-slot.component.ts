import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DuelSlotData {
  slots:   number;
  ongoing: boolean;
  team1:   { name: string; avatar: string | null; win: boolean }[];
  team2:   { name: string; avatar: string | null; win: boolean }[];
}

@Component({
  selector: 'app-lb-duel-slot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lb-duel-slot.component.html',
})
export class LbDuelSlotComponent {
  @Input() slot!: DuelSlotData;

  get slotClass(): string {
    if (this.slot.slots === 3) return 'flex-[3]';
    if (this.slot.slots === 2) return 'flex-[2]';
    return 'flex-1';
  }

  getBorderColor(win: boolean): string {
    if (this.slot.ongoing) return 'border-cyan-400';
    return win ? 'border-green-400' : 'border-red-600';
  }

  getTextColor(win: boolean): string {
    if (this.slot.ongoing) return 'text-white';
    return win ? 'text-green-400' : 'text-red-600';
  }

  getFontSize(): string {
    // Adapte la taille selon le nombre de joueurs
    if (this.slot.team1.length >= 4) return 'text-sm';
    if (this.slot.team1.length >= 3) return 'text-base';
    return 'text-xl';
  }
}
