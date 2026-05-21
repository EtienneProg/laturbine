import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-session-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './session-form.component.html',
})
export class SessionFormComponent {
  @Output() create = new EventEmitter<string>();
  @Output() close  = new EventEmitter<void>();

  today = new Date().toISOString().split('T')[0];
  date  = signal(this.today);

  onSubmit(): void {
    if (!this.date().trim()) return;
    this.create.emit(this.date());
  }
}
