import {Component, inject} from '@angular/core';
import {MatBadge} from '@angular/material/badge';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {ThemeService} from '../../core/services/theme.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [
    MatBadge,
    MatButton,
    MatIcon,
    NgIf
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  protected readonly themeService = inject(ThemeService);
}
