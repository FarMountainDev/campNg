import {computed, inject, Injectable, signal} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {ShoppingCart, CartItem} from '../../shared/models/shoppingCart';
import {map} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly baseUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  cart = signal<ShoppingCart | null>(null);
  itemCount = computed(() => {
    return this.cart()?.items.length;
  });
  cartTotals = computed(() => {
    const cart = this.cart();
    if (!cart) return null;
    const subtotal = cart.items.reduce((total, item) => total + item.price, 0);
    const discount = 0;
    const tax = 0;
    return {
      subtotal, discount, tax,
      total: subtotal + tax - discount
    }
  });

  getCart(id: string) {
    return this.http.get<ShoppingCart>(this.baseUrl + 'cart?id=' + id).pipe(
      map(cart => {
        this.cart.set(cart);
        return cart;
      })
    );
  }

  setCart(cart: ShoppingCart) {
    return this.http.post<ShoppingCart>(this.baseUrl + 'cart', cart).subscribe({
      next: cart => this.cart.set(cart)
    })
  }

  addItemToCart(item: CartItem) {
    const cart = this.cart() ?? this.createCart();
    cart.items.push(item);
    this.setCart(cart);
  }

  removeItemFromCart(item: CartItem) {
    const cart = this.cart();
    if (!cart) return;
    const index = cart.items.findIndex(i => i.campsiteId === item.campsiteId && i.startDate === item.startDate);
    if (index === -1) return;
    cart.items.splice(index, 1);
    this.setCart(cart);
  }

  deleteCart() {
    this.http.delete(this.baseUrl + 'cart?id=' + this.cart()?.id).subscribe({
      next: () => {
        localStorage.removeItem('cart_id');
        this.cart.set(null);
      }
    });
  }

  private createCart(): ShoppingCart {
    const cart = new ShoppingCart();
    localStorage.setItem('cart_id', cart.id);
    return cart;
  }
}
