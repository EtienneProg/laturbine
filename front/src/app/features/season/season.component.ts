import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-season-switch',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (confirming()) {
      <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-card border border-danger/40 rounded-2xl p-7 w-full max-w-sm mx-4">
          <h2 class="font-display text-lg text-danger tracking-wide mb-4">
            ⚠️ Nouvelle saison
          </h2>
          <p class="text-muted text-sm font-body mb-5">
            Ceci va réinitialiser l'ELO (1000) et TOUS les achievements de tous les joueurs.
            Un sauvegarde de la saison actuelle sera conservé dans l'historique. Cette action
            est irréversible.
          </p>

          <label class="block text-xs text-muted font-body uppercase tracking-widest mb-2">
            Nom de la nouvelle saison (optionnel)
          </label>
          <input
            [ngModel]="label()"
            (ngModelChange)="label.set($event)"
            type="text"
            placeholder="Saison 2026 - Été"
            class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-white font-body text-sm outline-none focus:border-neon/60 transition-all mb-6 placeholder:text-muted"
          />

          <div class="flex justify-end gap-3">
            <button
              (click)="confirming.set(false)"
              [disabled]="loading()"
              class="px-5 py-2.5 rounded-xl font-display text-xs tracking-widest bg-bg border border-border text-muted hover:text-white transition-all disabled:opacity-40"
            >
              Annuler
            </button>
            <button
              (click)="confirmClose()"
              [disabled]="loading()"
              class="px-5 py-2.5 rounded-xl font-display text-xs tracking-widest bg-danger/10 border border-danger/60 text-danger hover:bg-danger/20 transition-all disabled:opacity-40"
            >
              {{ loading() ? 'En cours...' : '✅ Confirmer la clôture' }}
            </button>
          </div>
        </div>
      </div>
    }

    <button
      (click)="confirming.set(true)"
      class="px-5 py-2.5 rounded-xl font-display text-xs tracking-widest bg-danger/10 border border-danger/60 text-danger hover:bg-danger/20 transition-all w-full"
    >
      🔄 Nouvelle saison
    </button>
  `,
})
export class SeasonSwitchComponent {
  private api = inject(ApiService);

  confirming = signal(false);
  loading    = signal(false);
  label      = signal('');

  confirmClose(): void {
    this.loading.set(true);

    this.api.post('/seasons/close-and-start', { label: this.label() || undefined }).subscribe({
      next: () => {
        this.loading.set(false);
        this.confirming.set(false);
        this.label.set('');
        window.location.reload();
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
