import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {OrderSummaryComponent} from '../../shared/components/order-summary/order-summary.component';
import {MatStepper, MatStepperModule} from '@angular/material/stepper';
import {MatButton} from '@angular/material/button';
import {Router, RouterLink} from '@angular/router';
import {StripeService} from '../../core/services/stripe.service';
import {
  ConfirmationToken,
  StripePaymentElement,
  StripePaymentElementChangeEvent
} from '@stripe/stripe-js';
import {SnackbarService} from '../../core/services/snackbar.service';
import {MatCheckboxChange, MatCheckboxModule} from '@angular/material/checkbox';
import {StepperSelectionEvent} from '@angular/cdk/stepper';
import {firstValueFrom} from 'rxjs';
import {CheckoutReviewComponent} from './checkout-review/checkout-review.component';
import {CartService} from '../../core/services/cart.service';
import {CurrencyPipe} from '@angular/common';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {ReservationService} from '../../core/services/reservation.service';
import {OrderToCreate} from '../../shared/models/order';
import {OrderService} from '../../core/services/order.service';

@Component({
  selector: 'app-checkout',
  imports: [
    OrderSummaryComponent,
    MatStepperModule,
    MatCheckboxModule,
    MatButton,
    MatProgressSpinner,
    RouterLink,
    CheckoutReviewComponent,
    CurrencyPipe
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit, OnDestroy{
  private readonly stripeService = inject(StripeService);
  private readonly snackbar = inject(SnackbarService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);
  protected readonly cartService = inject(CartService);
  protected readonly reservationService = inject(ReservationService);
  paymentElement?: StripePaymentElement;
  completionStatus = signal<{terms: boolean, payment: boolean}>({
    terms: false,
    payment: false
  });
  confirmationToken?: ConfirmationToken;
  termsAccepted = false;
  loading = false;

  async ngOnInit() {
    try {
      this.paymentElement = await this.stripeService.createPaymentElement();
      if (this.paymentElement) {
        this.paymentElement.mount('#payment-element');
        this.paymentElement.on('change', this.handlePaymentChange);
      }
    } catch (error: any) {
      this.snackbar.error(error.message);
    }
  }

  ngOnDestroy() {
    this.stripeService.disposeElements();
  }

  handleTermsChange(event: MatCheckboxChange) {
    this.termsAccepted = event.checked;
    this.completionStatus.update(state => {
      state.terms = event.checked;
      return state;
    });
  }

  handlePaymentChange = (event: StripePaymentElementChangeEvent) => {
    this.completionStatus.update(state => {
      state.payment = event.complete
      return state;
    });
  }

  async getConfirmationToken() {
    try {
      if (Object.values(this.completionStatus()).every((status) => status)) {
        const result = await this.stripeService.createConfirmationToken();
        if (result.error) throw new Error(result.error.message);
        this.confirmationToken = result.confirmationToken;
        console.log(this.confirmationToken);
      }
    } catch (error: any) {
      this.snackbar.error(error.message);
    }
  }

  async onStepChange(event: StepperSelectionEvent) {
    if (event.selectedIndex === 1) {
      await firstValueFrom(this.stripeService.createOrUpdatePaymentIntent());
    }
    if (event.selectedIndex === 2) {
      await this.getConfirmationToken();
    }
  }

  async confirmPayment(stepper: MatStepper) {
    this.loading = true;
    try {
      if (this.confirmationToken) {
        const result = await this.stripeService.confirmPayment(this.confirmationToken);
        if (result.paymentIntent?.status === 'succeeded') {
          const order = await this.createOrderModel();
          const orderResult = await firstValueFrom(this.orderService.createOrder(order));
          if (orderResult) {
            this.orderService.orderComplete = true;
            this.cartService.deleteCart();
            void this.router.navigateByUrl('/checkout/success');
          } else {
            throw new Error('Order creation failed');
          }
        } else if (result.error) {
          throw new Error(result.error.message);
        } else {
          throw new Error('Something went wrong with your payment');
        }
      }
    } catch (error: any) {
      this.snackbar.error(error.message || 'Problem with payment');
      stepper.previous();
    } finally {
      this.loading = false;
    }
  }

  private async createOrderModel(): Promise<OrderToCreate> {
    const cart = this.cartService.cart();
    const card = this.confirmationToken?.payment_method_preview.card;

    if (!cart?.id || !card) {
      throw new Error('Problem creating order');
    }

    return  {
      cartId: cart.id,
      paymentSummary: {
        last4: +card.last4,
        brand: card.brand,
        expMonth: card.exp_month,
        expYear: card.exp_year
      }
    }
  }
}
