import {Component, input} from '@angular/core';
import {CartItem} from '../../../shared/models/shoppingCart';
import {CurrencyPipe, DatePipe} from '@angular/common';

@Component({
  selector: 'app-cart-item',
  imports: [
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.scss'
})
export class CartItemComponent {
  item = input.required<CartItem>();
}
