import {Component, inject} from '@angular/core';
import {CartService} from '../../core/services/cart.service';
import {CartItemComponent} from './cart-item/cart-item.component';
import {OrderSummaryComponent} from '../../shared/components/order-summary/order-summary.component';
import {MatButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {EmptyStateComponent} from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-cart',
  imports: [
    CartItemComponent,
    OrderSummaryComponent,
    MatButton,
    RouterLink,
    EmptyStateComponent
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  protected readonly cartService = inject(CartService);
}
