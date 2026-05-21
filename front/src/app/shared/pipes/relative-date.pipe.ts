import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeDate',
  standalone: true,
})
export class RelativeDatePipe implements PipeTransform {
  transform(value: Date | string): string {
    const date  = new Date(value);
    const now   = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin  = Math.floor(diffMs / 60_000);
    const diffHrs  = Math.floor(diffMs / 3_600_000);
    const diffDays = Math.floor(diffMs / 86_400_000);

    if (diffMin < 1)   return 'À l\'instant';
    if (diffMin < 60)  return `Il y a ${diffMin} min`;
    if (diffHrs < 24)  return `Il y a ${diffHrs}h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7)  return `Il y a ${diffDays} jours`;

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }
}
