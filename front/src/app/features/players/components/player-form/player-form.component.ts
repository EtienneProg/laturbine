import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Player } from '../../../../core/models/player.model';

@Component({
  selector: 'app-player-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './player-form.component.html',
})
export class PlayerFormComponent implements OnInit {
  @Input() player: Player | null = null;
  @Output() save  = new EventEmitter<Partial<Player>>();
  @Output() close = new EventEmitter<void>();

  name       = signal('');
  discordTag = signal('');
  discordId  = signal('');

  get isEdit(): boolean { return !!this.player; }

  ngOnInit(): void {
    if (this.player) {
      this.name.set(this.player.name);
      this.discordTag.set(this.player.discordTag);
      this.discordId.set(this.player.discordId);
    }
  }

  onSubmit(): void {
    if (!this.name().trim()) return;
    this.save.emit({
      name:       this.name().trim(),
      discordTag: this.discordTag().trim(),
      discordId:  this.discordId().trim(),
    });
  }
}
