import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  @Input() title   = 'Confirmation';
  @Input() message = 'Es-tu sûr de vouloir effectuer cette action ?';
  @Input() confirmLabel = 'Confirmer';
  @Input() cancelLabel  = 'Annuler';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel  = new EventEmitter<void>();
}
