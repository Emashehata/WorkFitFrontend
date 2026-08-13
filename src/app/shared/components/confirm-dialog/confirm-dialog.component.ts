import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button/button.component';
import { ButtonVariant } from '../../../core/models/button.model';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  isOpen    = input<boolean>(false);
  title     = input<string>('Are you sure?');
  message   = input<string>('This action cannot be undone.');
  /** Label shown on the confirm button */
  confirmLabel = input<string>('Delete');
  /** Visual variant of the confirm button */
  confirmVariant = input<ButtonVariant>('danger');
  /** Icon class for the confirm button */
  confirmIcon = input<string>('fa-solid fa-trash');
  /** Icon shown in the dialog header */
  headerIcon  = input<string>('fa-solid fa-triangle-exclamation');

  confirmed = output<void>();
  cancelled = output<void>();

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.cancelled.emit();
    }
  }
}
