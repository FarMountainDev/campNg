import {Component, inject} from '@angular/core';
import {MatBadge} from '@angular/material/badge';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {ThemeService} from '../../core/services/theme.service';
import {NgIf} from '@angular/common';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MatTooltip} from '@angular/material/tooltip';
import {CartService} from '../../core/services/cart.service';

@Component({
  selector: 'app-header',
  imports: [
    MatBadge,
    MatButton,
    MatIcon,
    NgIf,
    RouterLink,
    RouterLinkActive,
    MatTooltip
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly cartService = inject(CartService);
}
