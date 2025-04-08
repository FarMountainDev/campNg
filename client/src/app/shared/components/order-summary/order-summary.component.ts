import {Component, inject} from '@angular/core';
import {CartService} from '../../../core/services/cart.service';
import {CurrencyPipe} from '@angular/common';

@Component({
  selector: 'app-order-summary',
  imports: [
    CurrencyPipe
  ],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.scss'
})
export class OrderSummaryComponent {
  protected readonly cartService = inject(CartService);
}
