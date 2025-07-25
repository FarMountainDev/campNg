import {Component, inject} from '@angular/core';
import {MatBadge} from '@angular/material/badge';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {CartService} from '../../core/services/cart.service';
import {AccountService} from '../../core/services/account.service';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatDivider} from '@angular/material/divider';
import {ThemeService} from '../../core/services/theme.service';
import {DatePipe, NgClass, NgIf} from '@angular/common';
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
    DatePipe,
    NgClass
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly cartService = inject(CartService);
  protected readonly accountService = inject(AccountService);
  private router = inject(Router);

  logout() {
    this.accountService.logout().subscribe({
      next: () => {
        this.accountService.currentUser.set(null);
        void this.router.navigateByUrl('/');
      }
    });
  }
}
