import {Component, inject} from '@angular/core';
import {MatBadge} from '@angular/material/badge';
import {MatButton, MatMiniFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {ThemeService} from '../../core/services/theme.service';
import {NgIf} from '@angular/common';
import {RouterLink, RouterLinkActive} from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [
    MatBadge,
    MatButton,
    MatIcon,
    NgIf,
    MatMiniFabButton,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  protected readonly themeService = inject(ThemeService);
}
