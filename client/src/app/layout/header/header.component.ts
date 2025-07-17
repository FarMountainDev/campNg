import {Component, computed, effect, inject, signal} from '@angular/core';
import {MatBadge} from '@angular/material/badge';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {CartService} from '../../core/services/cart.service';
import {AccountService} from '../../core/services/account.service';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatDivider} from '@angular/material/divider';
import {ThemeService} from '../../core/services/theme.service';
import {DatePipe, NgIf} from '@angular/common';
import {MatTooltip} from '@angular/material/tooltip';
import {IsModDirective} from '../../shared/directives/is-mod.directive';

@Component({
  selector: 'app-header',
  imports: [
    MatBadge,
    MatIcon,
    MatButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatDivider,
    RouterLink,
    RouterLinkActive,
    NgIf,
    MatTooltip,
    IsModDirective,
    DatePipe
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly cartService = inject(CartService);
  protected readonly accountService = inject(AccountService);
  private router = inject(Router);

  expirationTime = computed(() => {
    return this.cartService.itemCount()! > 0 ? this.cartService.cart()?.expirationTime : undefined;
  });
  now = signal(Date.now());

  constructor() {
    this.startClock();
  }

  private startClock() {
    effect(onCleanup => {
      const tick = () => {
        this.now.set(Date.now());
        const delay = 1000 - (Date.now() % 1000);
        timerId = setTimeout(tick, delay);
      };
      let timerId = setTimeout(tick, 0);
      onCleanup(() => clearTimeout(timerId));
    });
  }

  remainingMs = computed(() => {
    const exp = this.expirationTime();
    if (!exp) return 0;
    const expDate = exp instanceof Date ? exp : new Date(exp);
    return Math.max(0, expDate.getTime() - this.now());
  });

  remainingFormatted = computed(() => {
    const totalSec = Math.floor(this.remainingMs() / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  });

  logout() {
    this.accountService.logout().subscribe({
      next: () => {
        this.accountService.currentUser.set(null);
        void this.router.navigateByUrl('/');
      }
    });
  }
}
