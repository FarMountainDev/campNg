import {computed, effect, inject, Injectable, signal} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {ShoppingCart, CartItem} from '../../shared/models/shoppingCart';
import {map, of} from 'rxjs';
import {catchError, first} from 'rxjs/operators';
import {SnackbarService} from './snackbar.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly baseUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);
  private readonly snackbar = inject(SnackbarService);
  private lastExpiredCartId: string | null = null;

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

  now = signal(Date.now());
  expirationTime = computed(() => {
    const count = this.itemCount();
    return (count !== undefined && count > 0) ? this.cart()?.expirationTime : undefined;
  });
  remainingMs = computed(() => {
    const exp = this.expirationTime();
    if (!exp) return 0;
    try {
      return Math.max(0, exp.getTime() - this.now());
    } catch {
      return Math.max(0, new Date(String(exp)).getTime() - this.now());
    }
  });
  remainingFormatted = computed(() => {
    const totalSec = Math.floor(this.remainingMs() / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  });
  cartExpired = signal<string | null>(null);

  constructor() {
    this.startClock();
    this.watchCartExpiration();
  }

  getCart(id: string) {
    return this.http.get<ShoppingCart | null>(this.baseUrl + 'cart?id=' + id).pipe(
      map(cart => {
        if (!cart) {
          this.clearCart();
          return null;
        }
        this.cart.set(cart);
        return cart;
      }),
      catchError(error => {
        this.snackbar.error('Error loading cart');
        this.clearCart();
        return of(null);
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
        this.clearCart();
      }
    });
  }

  private createCart(): ShoppingCart {
    const cart = new ShoppingCart();
    localStorage.setItem('cart_id', cart.id);
    return cart;
  }

  private clearCart() {
    localStorage.removeItem('cart_id');
    this.cart.set(null);
  }

  private startClock() {
    effect(onCleanup => {
      const cart = this.cart();
      if (!cart?.items?.length) return;
      const tick = () => {
        this.now.set(Date.now());
        const delay = 1000 - (Date.now() % 1000);
        timerId = setTimeout(tick, delay);
      };
      let timerId = setTimeout(tick, 0);
      onCleanup(() => clearTimeout(timerId));
    });
  }

  private watchCartExpiration() {
    effect(() => {
      const currentCart = this.cart();
      if (!currentCart) return;
      const cartId = currentCart?.id;
      const remainingTime = this.remainingMs();

      if (remainingTime === 0 && currentCart && cartId) {
        if (cartId !== this.lastExpiredCartId) {
          this.lastExpiredCartId = cartId;
          this.getCart(cartId).pipe(
            first(),
            catchError(err => {
              this.snackbar.error('Error checking cart expiration');
              return of(null);
            })
          ).subscribe(result => {
            if (!result) {
              this.snackbar.warning('Your shopping cart has expired');
              setTimeout(() => this.cartExpired.set(cartId), 0);
            }
          });
        }
      } else if (currentCart && remainingTime > 0) {
        this.lastExpiredCartId = null;
      }
    });
  }
}
