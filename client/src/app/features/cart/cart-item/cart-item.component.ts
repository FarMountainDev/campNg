import {Component, inject, input} from '@angular/core';
import {CartItem} from '../../../shared/models/shoppingCart';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {CartService} from '../../../core/services/cart.service';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {ReservationService} from '../../../core/services/reservation.service';
import {normalizeDate} from '../../../shared/utils/date-utils';

@Component({
  selector: 'app-cart-item',
  imports: [
    CurrencyPipe,
    DatePipe,
    MatIcon,
    MatButton
  ],
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.scss'
})
export class CartItemComponent {
  protected readonly cartService = inject(CartService);
  protected readonly reservationService = inject(ReservationService);
  item = input.required<CartItem>();

  removeItemFromCart() {
    this.cartService.removeItemFromCart(this.item());
  }

  protected readonly normalizeDate = normalizeDate;
}
