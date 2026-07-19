import { Component, computed, input } from '@angular/core';
import { ButtonVariant } from '../../../../core/models/button.model';
 

@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.component.html'
})
export class ButtonComponent {

  variant = input<ButtonVariant>('primary');

  type = input<'button' | 'submit' | 'reset'>('button');

  loading = input(false);

  disabled = input(false);

  icon = input('');

  buttonClass = computed(() => {

    switch (this.variant()) {

      case 'secondary':
        return 'bg-slate-100 text-slate-700 hover:bg-slate-200';

      case 'danger':
        return 'bg-red-500 text-white hover:bg-red-600';

      case 'outline':
        return 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50';

      case 'ghost':
        return 'text-slate-600 hover:bg-slate-100';

      default:
        return 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl';

    }

  });

}