import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentStatusService } from '../services/payment/payment-status.service';
import { ToastService } from '../services/toast/toast.service';
import { PaymentStatus } from '../models/payment.models';

export const paymentGuard = () => {
  const paymentService = inject(PaymentStatusService);
  const router = inject(Router);
  const toast = inject(ToastService);

  const isPaid = paymentService.isPaid();
  const hasSubscription = paymentService.hasActiveSubscription();
  
  if (!isPaid && !hasSubscription) {
    router.navigate(['/pricing']);
    return false;
  }

  return true;
};

export const featureGuard = (featureKey: keyof PaymentStatus['features']) => {
  return () => {
    const paymentService = inject(PaymentStatusService);
    const router = inject(Router);
    const toast = inject(ToastService);

    if (paymentService.isFeatureLocked(featureKey)) {
      toast.warning(
        'Feature Locked',
        `This feature requires an upgrade to access.`
      );
      router.navigate(['/pricing']);
      return false;
    }

    return true;
  };
};

export const limitGuard = (
  limitKey: keyof PaymentStatus['features'],
  currentCount: () => number
) => {
  return () => {
    const paymentService = inject(PaymentStatusService);
    const router = inject(Router);
    const toast = inject(ToastService);

    const result = paymentService.checkLimit(
      limitKey,
      currentCount()
    );

    if (!result.isAllowed) {
      toast.warning(
        'Limit Reached',
        `You have reached the maximum of ${result.maxLimit}. Please upgrade your plan.`
      );
      router.navigate(['/pricing']);
      return false;
    }

    return true;
  };
};