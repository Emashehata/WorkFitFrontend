import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../../core/services/toast/toast.service';
 

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {

  toastService = inject(ToastService);

  icon(type: string) {

    switch (type) {

      case 'success':
        return 'fa-solid fa-check';

      case 'error':
        return 'fa-solid fa-xmark';

      case 'warning':
        return 'fa-solid fa-exclamation';

      default:
        return 'fa-solid fa-info';

    }

  }

}