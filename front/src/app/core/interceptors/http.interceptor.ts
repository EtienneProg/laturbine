import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/services/toast.service';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);
  const token  = auth.getToken();

  const cloned = token
    ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
    : req;

  return next(cloned).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        // Ne pas rediriger si on est déjà sur la page login
        if (!req.url.includes('/auth/login')) {
          auth.logout();
          router.navigate(['/login']);
          toastService.error('Session expirée, veuillez vous reconnecter');
        } else {
          toastService.error('Mot de passe incorrect');
        }
      } else if (err.status === 400) {
        const msg = err.error?.message;
        // message peut être un string ou un tableau
        const text = Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Requête invalide');
        toastService.error(text);
      } else if (err.status === 404) {
        toastService.error(err.error?.message ?? 'Ressource introuvable');
      } else if (err.status >= 500) {
        toastService.error('Erreur serveur, réessaie plus tard');
      }
      return throwError(() => err);
    })
  );
};
