import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../services/toast/toast.service';
import { AuthService } from '../../services/auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          toast.error('Session expired', 'Please log in again.');
          auth.logout();
          break;

        case 403:
          toast.error('Access denied', "You don't have permission to do this.");
          router.navigate(['/unauthorized']);
          break;

        case 404:
          toast.error('Not found', 'The requested resource was not found.');
          break;

        case 400:
          toast.error('Invalid request', extractValidationMessage(error) ?? 'Please check your input.');
          break;

        case 0:
          toast.error('Network error', 'Check your internet connection.');
          break;

        case 500:
        case 502:
        case 503:
          toast.error('Server error', 'Something went wrong on our end. Try again later.');
          break;

        default:
          toast.error('Unexpected error', 'Something went wrong. Please try again.');
      }

      return throwError(() => error);
    })
  );
};

function extractValidationMessage(error: HttpErrorResponse): string | null {
  const body = error.error;
  if (typeof body === 'string') return body;
  if (body?.title) return body.title;
  if (body?.errors) {
    const firstKey = Object.keys(body.errors)[0];
    return body.errors[firstKey]?.[0] ?? null;
  }
  return null;
}