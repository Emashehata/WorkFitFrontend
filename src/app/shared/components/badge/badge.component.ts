import { Component, computed, input } from '@angular/core';
import { BadgeVariant } from '../../../core/models/badge.model';
 

@Component({
  selector: 'app-badge',
  standalone: true,
  templateUrl: './badge.component.html'
})
export class BadgeComponent {
  variant = input<BadgeVariant>('neutral');
  icon = input('');

  badgeClass = computed(() => {
    switch (this.variant()) {
      case 'success': return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
      case 'warning': return 'bg-amber-50 text-amber-700 ring-amber-600/20';
      case 'danger':  return 'bg-red-50 text-red-700 ring-red-600/20';
      case 'info':    return 'bg-sky-50 text-sky-700 ring-sky-600/20';
      default:        return 'bg-slate-100 text-slate-600 ring-slate-500/20';
    }
  });
}