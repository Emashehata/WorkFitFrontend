import { Component, ElementRef, HostListener, effect, inject, input, output, viewChild } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  private elementRef = inject(ElementRef<HTMLElement>);
  private previouslyFocused: HTMLElement | null = null;

  title = input<string>('');
  isOpen = input<boolean>(false);
  size = input<'default' | 'wide'>('default');
  close = output<void>();
  dialog = viewChild<ElementRef<HTMLElement>>('dialog');

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.previouslyFocused = document.activeElement as HTMLElement | null;
        setTimeout(() => this.focusFirstElement());
      } else if (this.previouslyFocused) {
        this.previouslyFocused.focus();
        this.previouslyFocused = null;
      }
    });
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (!this.isOpen()) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.close.emit();
      return;
    }

    if (event.key === 'Tab') this.trapFocus(event);
  }

  private focusFirstElement() {
    const dialog = this.dialog()?.nativeElement;
    const firstFocusable = dialog?.querySelector<HTMLElement>(
      'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    (firstFocusable ?? dialog)?.focus();
  }

  private trapFocus(event: KeyboardEvent) {
    const dialog = this.dialog()?.nativeElement;
    if (!dialog) return;

    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
      'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ));
    if (!focusable.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = this.elementRef.nativeElement.ownerDocument.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
