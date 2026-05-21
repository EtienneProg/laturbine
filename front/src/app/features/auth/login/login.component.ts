import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';

const MOCK_PASSWORD = '1234';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private api    = inject(ApiService);
  private router = inject(Router);

  password = '';
  error    = '';
  loading  = false;

  onSubmit(): void {
    if (!this.password.trim()) return;
    this.loading = true;
    this.error   = '';

    this.api.post<{ token: string }>('/auth/login', { password: this.password })
      .subscribe({
        next: (res) => {
          this.auth.login(res.token);
          this.router.navigate(['/']);
        },
        error: () => {
          this.error   = 'Mot de passe incorrect.';
          this.loading = false;
        }
      });
  }
}
