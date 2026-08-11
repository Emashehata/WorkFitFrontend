import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ROUTES } from '../../constants/api-routes.constant.ts';
import { AuthService } from '../auth/auth.service';
import {
  PaymentRequest,
  PaymentResponse,
  CheckoutSessionRequest,
  CheckoutSessionResponse,
  CancelCheckoutSessionRequest,
} from '../../models/payment.models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = 'https://localhost:7296/api';

  // ⭐ STEP 1: Process payment - POST /api/payments
  processPayment(payment: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(
      `${this.baseUrl}${API_ROUTES.payments.process}`,
      payment,
    );
  }

  // ⭐ STEP 2: Get payment details by ID - GET /api/payments/{paymentId}
  getPaymentById(paymentId: string): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(
      `${this.baseUrl}${API_ROUTES.payments.byId(paymentId)}`,
    );
  }

  // ⭐ STEP 3: Create checkout session - POST /api/payments/checkout-session
  createCheckoutSession(
    request: CheckoutSessionRequest,
  ): Observable<CheckoutSessionResponse> {
    return this.http.post<CheckoutSessionResponse>(
      `${this.baseUrl}${API_ROUTES.payments.checkoutSession}`,
      request,
    );
  }

  // ⭐ Cancel checkout session
  cancelCheckoutSession(
    request: CancelCheckoutSessionRequest,
  ): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(
      `${this.baseUrl}${API_ROUTES.payments.checkoutSessionCancel}`,
      request,
    );
  }

  // ⭐ ==================== HELPER METHODS ====================

  isPaymentSuccessful(status: string): boolean {
    return status === 'Success' || status === 'Processing';
  }

  isPaymentPending(status: string): boolean {
    return status === 'Pending';
  }

  isPaymentFailed(status: string): boolean {
    return status === 'Failed';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      Success: '✅ Success',
      Failed: '❌ Failed',
      Pending: '⏳ Pending',
      Processing: '🔄 Processing',
      Cancelled: '🚫 Cancelled',
      Refunded: '↩️ Refunded',
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      Success: 'bg-emerald-100 text-emerald-700',
      Failed: 'bg-red-100 text-red-700',
      Pending: 'bg-yellow-100 text-yellow-700',
      Processing: 'bg-blue-100 text-blue-700',
      Cancelled: 'bg-gray-100 text-gray-700',
      Refunded: 'bg-purple-100 text-purple-700',
    };
    return classes[status] || 'bg-gray-100 text-gray-700';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      Success: 'fa-solid fa-check-circle',
      Failed: 'fa-solid fa-xmark-circle',
      Pending: 'fa-solid fa-clock',
      Processing: 'fa-solid fa-spinner fa-spin',
      Cancelled: 'fa-solid fa-ban',
      Refunded: 'fa-solid fa-rotate-left',
    };
    return icons[status] || 'fa-solid fa-circle';
  }

  formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  redirectToCheckout(checkoutUrl: string): void {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  }

  openCheckoutInNewTab(checkoutUrl: string): void {
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
    }
  }

  canManagePayments(): boolean {
    const roles = this.authService.getUserRoles();
    return roles.some(
      (role) =>
        role === 'SuperAdmin' ||
        role === 'OrganizationOwner' ||
        role === 'Admin',
    );
  }
}
