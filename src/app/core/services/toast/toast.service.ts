import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from '../../models/toast.model';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  readonly toasts = signal<Toast[]>([]);

  private id = 0;

  show(
    title: string,
    message: string,
    type: ToastType = 'info',
    duration = 4000
  ): void {

    const toast: Toast = {

      id: ++this.id,

      title,

      message,

      type,

      duration,

      progress: 100,

      visible: true,

      paused: false,

      createdAt: Date.now(),

      remaining: duration,

      startTime: Date.now()

    };

    this.toasts.update(list => [...list, toast]);

    this.start(toast);

  }

  success(title: string, message: string) {
    this.show(title, message, 'success');
  }

  error(title: string, message: string) {
    this.show(title, message, 'error');
  }

  warning(title: string, message: string) {
    this.show(title, message, 'warning');
  }

  info(title: string, message: string) {
    this.show(title, message, 'info');
  }

  pause(toast: Toast): void {

    if (toast.paused) return;

    toast.paused = true;

    toast.remaining -= Date.now() - toast.startTime;

    if (toast.timeoutId) clearTimeout(toast.timeoutId);

    if (toast.intervalId) clearInterval(toast.intervalId);

  }

  resume(toast: Toast): void {

    if (!toast.paused) return;

    toast.paused = false;

    this.start(toast);

  }

  remove(id: number): void {

    const toast = this.toasts().find(x => x.id === id);

    if (!toast) return;

    toast.visible = false;

    this.toasts.update(list => [...list]);

    setTimeout(() => {

      if (toast.timeoutId) clearTimeout(toast.timeoutId);

      if (toast.intervalId) clearInterval(toast.intervalId);

      this.toasts.update(list => list.filter(x => x.id !== id));

    }, 300);

  }

  private start(toast: Toast): void {

    toast.startTime = Date.now();

    toast.timeoutId = setTimeout(() => {

      this.remove(toast.id);

    }, toast.remaining);

    toast.intervalId = setInterval(() => {

      const elapsed = Date.now() - toast.startTime;

      toast.progress = Math.max(
        0,
        (toast.remaining - elapsed) / toast.duration * 100
      );

      this.toasts.update(list => [...list]);

    }, 16);

  }

}