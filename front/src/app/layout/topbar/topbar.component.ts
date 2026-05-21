import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule],
  templateUrl: './topbar.component.html',
})
export class TopbarComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  today = new Date();

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
