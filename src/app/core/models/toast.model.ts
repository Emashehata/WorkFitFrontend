export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {

  id: number;

  title: string;

  message: string;

  type: ToastType;

  duration: number;

  progress: number;

  visible: boolean;

  paused: boolean;

  createdAt: number;

  remaining: number;

  startTime: number;

  timeoutId?: ReturnType<typeof setTimeout>;

  intervalId?: ReturnType<typeof setInterval>;

}