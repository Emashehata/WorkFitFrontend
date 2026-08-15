import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PaymentService } from '../../core/services/payment/payment.service';
import { PaymentStatusService } from '../../core/services/payment/payment-status.service';
import { OrganizationService } from '../../core/services/organization/organization.service';
import { ToastService } from '../../core/services/toast/toast.service';
import { CheckoutSessionRequest } from '../../core/models/payment.models';

interface PricingPlan {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  description: string;
  features: string[];
  isPopular?: boolean;
  isCurrent?: boolean;
  buttonText: string;
  billingCycle: string;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pricing.component.html',
})
export class PricingComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private paymentStatusService = inject(PaymentStatusService);
  private organizationService = inject(OrganizationService);
  private router = inject(Router);
  private toast = inject(ToastService);

  isLoading = signal(false);
  isOrganizationLoading = signal(true);
  currentPlan = this.paymentStatusService.currentPlan;
  isPaid = this.paymentStatusService.isPaid;
  organizationId = signal<string | null>(null);

  billingCycle = signal<'month' | 'year'>('month');

  plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      subtitle: 'Try WorkFit',
      price: 0,
      currency: 'EGP',
      interval: 'month',
      description: 'For quick, everyday use',
      features: [
        'Core features',
        'Limited messages and uploads',
        'Limited skill assessments',
        'Basic reporting',
        'Up to 5 employees',
        'Community support',
      ],
      buttonText: 'Current Plan',
      billingCycle: 'monthly',
    },
    {
      id: 'basic',
      name: 'Basic',
      subtitle: 'Expanded access',
      price: 220,
      currency: 'EGP',
      interval: 'month',
      description: 'Explore topics in depth with longer conversations',
      features: [
        'Core features',
        'More messages and uploads',
        'More skill assessments',
        'Advanced reporting',
        'Up to 25 employees',
        'Email support',
      ],
      buttonText: 'Upgrade to Basic',
      billingCycle: 'monthly',
    },
    {
      id: 'pro',
      name: 'Professional',
      subtitle: 'Your AI assistant',
      price: 999.99,
      currency: 'EGP',
      interval: 'month',
      description: 'Save personal context with an AI assistant for ongoing work',
      isPopular: true,
      features: [
        'Advanced models',
        'Advanced skill assessments',
        'Expanded memory across chats',
        'Codex coding agent',
        'Maximum access to Codex',
        'Up to 100 employees',
        'Priority support',
        'Custom branding',
      ],
      buttonText: 'Upgrade to Pro',
      billingCycle: 'monthly',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      subtitle: 'Maximum power',
      price: 5400,
      currency: 'EGP',
      interval: 'month',
      description: 'State-of-the-art intelligence to automate your most ambitious work',
      features: [
        'Everything in Pro and:',
        '5x or 20x more usage than Pro',
        'Frontier Pro model',
        'Unlimited employees',
        'Unlimited projects',
        'Dedicated support',
        'SLA guarantee',
        'Custom deployment',
      ],
      buttonText: 'Contact Sales',
      billingCycle: 'monthly',
    },
  ];

  ngOnInit(): void {
    this.loadOrganization();
    this.updateCurrentPlan();
  }

  loadOrganization(): void {
    this.isOrganizationLoading.set(true);
    this.organizationService.getOrganization().subscribe({
      next: (org) => {
        this.organizationId.set(org.id);
        this.isOrganizationLoading.set(false);
      },
      error: () => {
        this.isOrganizationLoading.set(false);
        this.toast.error('Error', 'Failed to load organization details.');
      },
    });
  }

  updateCurrentPlan(): void {
    const current = this.currentPlan();
    this.plans = this.plans.map((plan) => ({
      ...plan,
      isCurrent: plan.id === current.toLowerCase(),
    }));
  }

  toggleBillingCycle(): void {
    this.billingCycle.update((val) => (val === 'month' ? 'year' : 'month'));
    this.updatePrices();
  }

  updatePrices(): void {
    const multiplier = this.billingCycle() === 'year' ? 10 : 1;
    this.plans = this.plans.map((plan) => {
      if (plan.id === 'free') return plan;
      return {
        ...plan,
        price: Math.round(plan.price * multiplier),
        interval: this.billingCycle(),
        billingCycle: this.billingCycle() === 'month' ? 'monthly' : 'annual',
      };
    });
  }

  getPriceDisplay(plan: PricingPlan): string {
    if (plan.id === 'free') return 'Free';
    if (plan.price === 0) return 'Free';
    return `${plan.currency} ${plan.price}`;
  }

  getIntervalDisplay(plan: PricingPlan): string {
    if (plan.id === 'free') return '';
    return `/ ${plan.interval}`;
  }

  // ⭐ ==================== PAYMENT FLOW ====================

  selectPlan(plan: PricingPlan): void {
    if (plan.id === 'free') {
      this.toast.info('Free Plan', 'You are already on the free plan.');
      return;
    }

    if (plan.id === 'enterprise') {
      this.toast.info(
        'Contact Sales',
        'Please contact our sales team for enterprise pricing.'
      );
      return;
    }

    const orgId = this.organizationId();
    if (!orgId) {
      this.toast.error('Error', 'Organization not found.');
      return;
    }

    this.isLoading.set(true);

    // ⭐ Create checkout session directly - No separate processPayment call!
    const checkoutData: CheckoutSessionRequest = {
      referenceId: orgId,
      referenceType: 'OrganizationSubscription',
      amount: plan.price,
      currency: plan.currency.toLowerCase(),
      description: `${plan.name} Plan - ${plan.billingCycle}`,
    };

    console.log('🚀 Creating checkout session:', checkoutData);

    this.paymentService.createCheckoutSession(checkoutData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        console.log('✅ Checkout session created:', response);
        
        // ⭐ Save payment ID for status check
        localStorage.setItem('last_payment_id', response.paymentId);
        
        // ⭐ Redirect to Stripe checkout
        this.paymentService.redirectToCheckout(response.checkoutUrl);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('❌ Checkout error:', err);
        this.toast.error(
          'Checkout Failed',
          err.error?.message || 'Failed to create checkout session.'
        );
      },
    });
  }

  getInitials(name: string): string {
    return name.charAt(0).toUpperCase();
  }
}