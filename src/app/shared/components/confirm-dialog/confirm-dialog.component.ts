import {
  Component,
  input,
  output,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  title = input.required<string>();
  message = input.required<string>();
  showInput = input<boolean>(false);
  inputLabel = input<string>('Note');
  confirmLabel = input<string>('Confirm');
  cancelLabel = input<string>('Cancel');

  inputChange = output<string>();
  confirmed = output<void>();
  cancelled = output<void>();

  noteValue = signal('');

  onNoteChange(value: string) {
    this.noteValue.set(value);
    this.inputChange.emit(value);
  }

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }
}