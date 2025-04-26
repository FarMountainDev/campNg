import {inject, Injectable} from '@angular/core';
import {CartService} from './cart.service';
import {forkJoin, of, tap} from 'rxjs';
import {AccountService} from './account.service';
import {ThemeService} from './theme.service';
import {SignalrService} from './signalr.service';

@Injectable({
  providedIn: 'root'
})
export class InitService {
  private readonly cartService = inject(CartService);
  private readonly accountService = inject(AccountService);
  private readonly themeService = inject(ThemeService);
  private readonly signalrService = inject(SignalrService);

  init() {
    this.themeService.applyThemeSynchronously();

    const cartId = localStorage.getItem('cart_id');
    const cart$ = cartId ? this.cartService.getCart(cartId) : of(null);

    return forkJoin({
      cart: cart$,
      user: this.accountService.getUserInfo().pipe(
        tap(user => {
          if (user) {
            this.signalrService.createHubConnection();
          }
        })
      )
    })
  }
}
