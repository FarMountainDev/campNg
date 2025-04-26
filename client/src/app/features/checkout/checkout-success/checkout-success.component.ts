import {Component, inject, OnDestroy} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {CurrencyPipe, DatePipe, NgIf} from '@angular/common';
import {PaymentCardPipe} from '../../../shared/pipes/payment-card.pipe';
import {OrderService} from '../../../core/services/order.service';
import {SignalrService} from '../../../core/services/signalr.service';

@Component({
  selector: 'app-checkout-success',
  imports: [
    RouterLink,
    MatButton,
    MatProgressSpinner,
    DatePipe,
    CurrencyPipe,
    PaymentCardPipe,
    NgIf
  ],
  templateUrl: './checkout-success.component.html',
  styleUrl: './checkout-success.component.scss'
})
export class CheckoutSuccessComponent implements OnDestroy {
  protected readonly signalrService: SignalrService = inject(SignalrService);
  private readonly orderService: OrderService = inject(OrderService);

  ngOnDestroy() {
    this.orderService.orderComplete = false;
    this.signalrService.orderSignal.set(null);
  }
}
