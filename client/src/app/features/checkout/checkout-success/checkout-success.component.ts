import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {Router, RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {CurrencyPipe, DatePipe, NgIf} from '@angular/common';
import {PaymentCardPipe} from '../../../shared/pipes/payment-card.pipe';
import {OrderService} from '../../../core/services/order.service';
import {SignalrService} from '../../../core/services/signalr.service';
import {SnackbarService} from '../../../core/services/snackbar.service';

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
export class CheckoutSuccessComponent implements OnInit, OnDestroy {
  protected readonly signalrService: SignalrService = inject(SignalrService);
  private readonly orderService: OrderService = inject(OrderService);
  private readonly snackbar = inject(SnackbarService);
  private readonly router = inject(Router);
  private timeoutId?: number;

  ngOnInit() {
    if (!this.signalrService.isConnected()) {
      console.warn('SignalR not connected on checkout-success init');
    }
    this.timeoutId = window.setTimeout(() => {
      if (!this.signalrService.orderSignal()) {
        console.warn('Order notification timeout - checking order status');
        void this.checkOrderStatus();
      }
    }, 30000);
  }

  ngOnDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.orderService.orderComplete = false;
    this.signalrService.orderSignal.set(null);
  }

  private async checkOrderStatus() {
    const orderId = this.orderService.getCurrentOrderId();
    if (!orderId) {
      console.error('No current order ID found. Cannot check order status.');
      this.snackbar.error('Could not retrieve order status. Please check your orders in your account. If the issue persists, contact support.');
      void this.router.navigate(['/orders']);
      return;
    }
    try {
      const order = await firstValueFrom(this.orderService.getOrderDetails(orderId));
      if (order && order.status === 'PaymentReceived') {
        this.signalrService.orderSignal.set(order);
        this.orderService.orderComplete = true;
        this.snackbar.success('Order completed successfully!');
      } else {
        this.snackbar.warn('Order is still being processed. Please check back later.');
        void this.router.navigate(['/orders', orderId]);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      this.snackbar.error('Could not retrieve order status. Please check your orders in your account. If the issue persists, contact support.');
      void this.router.navigate(['/orders']);
    } finally {
      this.signalrService.orderSignal.set(null);
      this.orderService.clearCurrentOrderId();
    }
  }
}
