import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentStatusService } from '../../../core/services/payment/payment-status.service';
import { PaymentService } from '../../../core/services/payment/payment.service';
import { ToastService } from '../../../core/services/toast/toast.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-6"
    >
      <div
        class="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl text-center border border-white/50"
      >
        <!-- Success Icon -->
        <div
          class="w-24 h-24 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-bounce"
        >
          <i class="fa-solid fa-check text-5xl text-emerald-600"></i>
        </div>

        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Payment Successful! 🎉
        </h1>
        <p class="text-gray-600 mb-6">
          Your payment has been completed successfully.
        </p>

        <!-- Loading/Status -->
        @if (isLoading()) {
          <div class="flex justify-center py-4">
            <div
              class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"
            ></div>
          </div>
        } @else {
          <!-- Payment Details -->
          <div class="bg-gray-50 rounded-xl p-4 text-left mb-6">
            <div class="flex justify-between py-2 border-b border-gray-100">
              <span class="text-gray-500">Plan</span>
              <span class="font-semibold">{{ planName() }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-100">
              <span class="text-gray-500">Status</span>
              <span class="text-emerald-600 font-semibold">Active</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-gray-500">Valid Until</span>
              <span class="font-semibold">{{ validUntil() }}</span>
            </div>
          </div>

          <!-- Unlock Features -->
          <div
            class="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 mb-6"
          >
            <p class="text-sm text-emerald-700">
              <i class="fa-solid fa-unlock mr-2"></i>
              All premium features are now unlocked!
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col gap-3">
            <button
              (click)="goToDashboard()"
              class="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              <i class="fa-solid fa-rocket mr-2"></i>
              Go to Dashboard
            </button>
            <button
              (click)="goToPricing()"
              class="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
            >
              View Plans
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class PaymentSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private paymentService = inject(PaymentService);
  private paymentStatusService = inject(PaymentStatusService);
  private toast = inject(ToastService);

  isLoading = signal(true);
  planName = signal('Pro');
  validUntil = signal('');

  ngOnInit(): void {
    const paymentId = this.route.snapshot.queryParamMap.get('payment_id');

    if (paymentId) {
      this.checkPaymentStatus(paymentId);
    } else {
      this.handleLocalSuccess();
    }
  }

  private checkPaymentStatus(paymentId: string): void {
    this.isLoading.set(true);
    console.log('🔍 Checking payment status for:', paymentId);

    this.paymentStatusService
      .checkPaymentStatusByPaymentId(paymentId)
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          const plan = response.status.subscriptionPlan || 'Pro';
          this.planName.set(plan);
          this.setValidUntil();

          if (response.status.isPaid) {
            this.toast.success(
              'Payment Successful!',
              'Your subscription is now active.',
            );
          } else {
            this.toast.warning(
              'Payment Pending',
              'Your payment is being processed.',
            );
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          console.error('Error checking payment:', error);
          this.handleLocalSuccess();
        },
      });
  }

  private handleLocalSuccess(): void {
    this.paymentStatusService.setPaidStatus('Pro');
    this.planName.set('Pro');
    this.isLoading.set(false);
    this.setValidUntil();
    this.toast.success('Welcome!', 'Your subscription is active.');
  }

  private setValidUntil(): void {
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    this.validUntil.set(
      expiry.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    );
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToPricing(): void {
    this.router.navigate(['/pricing']);
  }
}
