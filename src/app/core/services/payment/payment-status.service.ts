import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, of, switchMap, catchError } from 'rxjs';
import { PaymentService } from './payment.service';
import {
  PaymentStatus,
  PaymentStatusResponse,
  FREE_TIER,
  PaymentResponse,
} from '../../models/payment.models';

@Injectable({
  providedIn: 'root',
})
export class PaymentStatusService {
  private paymentService = inject(PaymentService);

  private paymentStatusSignal = signal<PaymentStatus | null>(null);
  readonly paymentStatus = this.paymentStatusSignal.asReadonly();

  readonly isPaid = computed(() => this.paymentStatusSignal()?.isPaid ?? false);
  readonly hasActiveSubscription = computed(
    () => this.paymentStatusSignal()?.hasActiveSubscription ?? false,
  );
  readonly currentPlan = computed(
    () => this.paymentStatusSignal()?.subscriptionPlan ?? 'Free',
  );
  readonly features = computed(
    () => this.paymentStatusSignal()?.features ?? FREE_TIER,
  );


  checkPaymentStatusByPaymentId(
    paymentId: string,
  ): Observable<PaymentStatusResponse> {
    return this.paymentService.getPaymentById(paymentId).pipe(
      switchMap((payment: PaymentResponse) => {
        const status = this.mapPaymentToStatus(payment);
        this.paymentStatusSignal.set(status);
        localStorage.setItem('workfit_payment_status', JSON.stringify(status));
        return of({ status });
      }),
      catchError((error) => {
        console.error('Error checking payment status:', error);
        return this.getFallbackStatus();
      }),
    );
  }

  /**
   * Check payment status from localStorage
   */
  checkPaymentStatus(): Observable<PaymentStatusResponse> {
    const stored = localStorage.getItem('workfit_payment_status');

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.paymentStatusSignal.set(parsed);
        return of({ status: parsed });
      } catch {
        // Invalid JSON
      }
    }

    return this.getFallbackStatus();
  }

  /**
   * Map PaymentResponse to PaymentStatus
   */
  private mapPaymentToStatus(payment: PaymentResponse): PaymentStatus {
    const isSuccessful =
      payment.status === 'Succeeded' || payment.status === 'Processing';
    const plan = this.determinePlan(payment.amount);

    return {
      isPaid: isSuccessful,
      hasActiveSubscription: isSuccessful,
      subscriptionStatus: isSuccessful ? 'Active' : 'Trial',
      features: this.getFeaturesForPlan(plan),
    };
  }

  /**
   * Determine plan based on amount
   */
  private determinePlan(amount: number): string {
    if (amount >= 5000) return 'Enterprise';
    if (amount >= 500) return 'Pro';
    if (amount >= 100) return 'Basic';
    return 'Free';
  }

  /**
   * Get fallback status
   */
  private getFallbackStatus(): Observable<PaymentStatusResponse> {
    const defaultStatus: PaymentStatus = {
      isPaid: false,
      hasActiveSubscription: false,
      subscriptionPlan: 'Free',
      subscriptionStatus: 'Trial',
      features: FREE_TIER,
    };
    this.paymentStatusSignal.set(defaultStatus);
    localStorage.setItem(
      'workfit_payment_status',
      JSON.stringify(defaultStatus),
    );
    return of({ status: defaultStatus });
  }

  /**
   * Set paid status manually
   */
  setPaidStatus(plan: 'Basic' | 'Pro' | 'Enterprise' = 'Pro'): void {
    const status: PaymentStatus = {
      isPaid: true,
      hasActiveSubscription: true,
      subscriptionPlan: plan,
      subscriptionStatus: 'Active',
      features: this.getFeaturesForPlan(plan),
    };
    this.paymentStatusSignal.set(status);
    localStorage.setItem('workfit_payment_status', JSON.stringify(status));
  }

  /**
   * Clear payment status
   */
  clearPaymentStatus(): void {
    this.paymentStatusSignal.set(null);
    localStorage.removeItem('workfit_payment_status');
  }

  /**
   * Get features for a specific plan
   */
  private getFeaturesForPlan(plan: string): PaymentStatus['features'] {
    const features = {
      Free: {
        maxEmployees: 5,
        maxProjects: 2,
        maxTeams: 1,
        hasAdvancedAnalytics: false,
        hasAIAssessments: false,
        hasCustomBranding: false,
        hasAPIAccess: false,
      },
      Basic: {
        maxEmployees: 25,
        maxProjects: 10,
        maxTeams: 5,
        hasAdvancedAnalytics: false,
        hasAIAssessments: true,
        hasCustomBranding: false,
        hasAPIAccess: false,
      },
      Pro: {
        maxEmployees: 100,
        maxProjects: 50,
        maxTeams: 20,
        hasAdvancedAnalytics: true,
        hasAIAssessments: true,
        hasCustomBranding: true,
        hasAPIAccess: true,
      },
      Enterprise: {
        maxEmployees: 9999,
        maxProjects: 9999,
        maxTeams: 9999,
        hasAdvancedAnalytics: true,
        hasAIAssessments: true,
        hasCustomBranding: true,
        hasAPIAccess: true,
      },
    };
    return features[plan as keyof typeof features] || features.Free;
  }

  // ⭐ ==================== HELPER METHODS ====================

  getFeatures(): PaymentStatus['features'] {
    return this.features();
  }

  hasFeature(featureKey: keyof PaymentStatus['features']): boolean {
    const features = this.features();
    return features[featureKey] as boolean;
  }

  checkLimit(
    limitKey: keyof PaymentStatus['features'],
    currentCount: number,
  ): { isAllowed: boolean; remaining: number; maxLimit: number } {
    const features = this.features();
    const maxLimit = features[limitKey] as number;
    const remaining = Math.max(0, maxLimit - currentCount);

    return {
      isAllowed: currentCount < maxLimit,
      remaining,
      maxLimit,
    };
  }

  isFeatureLocked(featureKey: keyof PaymentStatus['features']): boolean {
    const features = this.features();
    const value = features[featureKey];
    if (typeof value === 'number') {
      return value === 0;
    }
    return !value;
  }

  getPlanDisplayName(): string {
    const plan = this.currentPlan();
    const names: Record<string, string> = {
      Free: 'Free',
      Basic: 'Basic',
      Pro: 'Professional',
      Enterprise: 'Enterprise',
    };
    return names[plan] || plan;
  }

  getPlanBadgeClass(): string {
    const plan = this.currentPlan();
    const classes: Record<string, string> = {
      Free: 'bg-gray-100 text-gray-700',
      Basic: 'bg-blue-100 text-blue-700',
      Pro: 'bg-purple-100 text-purple-700',
      Enterprise: 'bg-amber-100 text-amber-700',
    };
    return classes[plan] || 'bg-gray-100 text-gray-700';
  }
}
