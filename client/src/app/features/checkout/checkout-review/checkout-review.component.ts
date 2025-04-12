import {Component, inject, Input} from '@angular/core';
import {CartService} from '../../../core/services/cart.service';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {ConfirmationToken} from '@stripe/stripe-js';
import {PaymentCardPipe} from '../../../shared/pipes/payment-card.pipe';
import {ReservationService} from '../../../core/services/reservation.service';

@Component({
  selector: 'app-checkout-review',
  imports: [
    CurrencyPipe,
    PaymentCardPipe,
    DatePipe
  ],
  templateUrl: './checkout-review.component.html',
  styleUrl: './checkout-review.component.scss'
})
export class CheckoutReviewComponent {
  protected readonly cartService = inject(CartService);
  protected readonly reservationService = inject(ReservationService);
  @Input() confirmationToken?: ConfirmationToken;
}
