import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Session } from '../../../../core/models/session.model';

@Component({
  selector: 'app-registrations-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './registrations-list.component.html',
})
export class RegistrationsListComponent{
  @Input() session!: Session;
  @Output() close = new EventEmitter<void>();
}
