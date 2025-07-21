import {computed, effect, inject, Injectable, OnDestroy, signal} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {ShoppingCart, CartItem} from '../../shared/models/shoppingCart';
import {BehaviorSubject, firstValueFrom, map, of, Subject, tap} from 'rxjs';
import {catchError, first, filter, switchMap, shareReplay, takeUntil, distinctUntilChanged} from 'rxjs/operators';
import {SnackbarService} from './snackbar.service';
import { ErrorHandlingService } from './error-handling.service';

@Injectable({
  providedIn: 'root'
})
export class CartService implements OnDestroy {
  private readonly baseUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);
  private readonly snackbar = inject(SnackbarService);
  private readonly errorHandler = inject(ErrorHandlingService);
  private destroy$ = new Subject<void>();
  private cartExpirationCheck$ = new BehaviorSubject<string | null>(null);
  private cartCheckRequests = new Map<string, Promise<boolean>>();
  private lastExpiredCartId: string | null = null;

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

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
  millisecondsToLive = computed(() => {
    const exp = this.expirationTime();
    if (!exp) return 0;
    try {
      return exp.getTime() - this.now();
    } catch {
      return new Date(String(exp)).getTime() - this.now();
    }
  });
  formattedTimeToLive = computed(() => {
    const msToLive = this.millisecondsToLive();
    if (msToLive <= 0) return "0:00";
    const totalSec = Math.floor(msToLive / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  });
  cartExpiredTrigger = signal<string | null>(null);

  constructor() {
    this.startClock();
    this.watchCartExpiration();
  }

  getCart(id: string) {
    return this.fetchCart(id).pipe(
      map(cart => {
        if (!cart) {
          this.clearCart();
          return null;
        }
        this.cart.set(cart);
        return cart;
      })
    );
  }

  setCart(cart: ShoppingCart) {
    this.http.post<ShoppingCart>(this.baseUrl + 'cart', cart).pipe(
      tap(responseCart => this.cart.set(responseCart)),
      catchError(error => {
        this.snackbar.error('Error saving cart');
        return this.errorHandler.handleHttpError(error);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  deleteCart() {
    this.http.delete(this.baseUrl + 'cart?id=' + this.cart()?.id).pipe(
      tap(() => { this.clearCart(); }),
      catchError(error => {
        this.snackbar.error('Error deleting cart');
        return this.errorHandler.handleHttpError(error);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
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

  async isCartExpired(): Promise<boolean> {
    const currentCart = this.cart();
    if (!currentCart?.id) return true;

    const cartId = currentCart.id;

    if (this.cartCheckRequests.has(cartId)) {
      return this.cartCheckRequests.get(cartId)!;
    }

    const checkPromise = firstValueFrom(
      this.fetchCart(cartId).pipe(
        map(cart => {
          const isExpired = !cart ||
            (cart.expirationTime ? new Date(cart.expirationTime).getTime() <= Date.now() : false);
          if (isExpired) {
            this.snackbar.warn('Your shopping cart has expired');
            this.clearCart();
          }
          return isExpired;
        }),
        catchError((err) => {
          console.error('Error checking cart expiration:', err);
          this.snackbar.error('Error checking cart expiration');
          return of(true);
        })
      )
    ).finally(() => {
      this.cartCheckRequests.delete(cartId);
    });

    this.cartCheckRequests.set(cartId, checkPromise);
    return checkPromise;
  }

  private fetchCart(id: string) {
    return this.http.get<ShoppingCart | null>(`${this.baseUrl}cart?id=${id}`).pipe(
      catchError(error => {
        return this.errorHandler.handleHttpError(error);
      })
    );
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
      const remainingTime = this.millisecondsToLive();
      const bufferMilliseconds = -4200;
      if (remainingTime <= bufferMilliseconds && currentCart && cartId) {
        if (cartId !== this.lastExpiredCartId) {
          this.lastExpiredCartId = cartId;
          this.isCartExpired().then(isExpired => {
            if (isExpired) {
              this.cartExpiredTrigger.set(cartId);
            }
          });
        }
      } else if (currentCart && remainingTime > 0) {
        this.lastExpiredCartId = null;
      }
    });
  }
}
