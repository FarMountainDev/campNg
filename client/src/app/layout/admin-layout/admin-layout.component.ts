import {Component, inject, ViewEncapsulation} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatToolbar} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {AccountService} from '../../core/services/account.service';
import {ThemeService} from '../../core/services/theme.service';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  imports: [
    RouterOutlet,
    MatToolbar,
    RouterLink,
    MatSidenavModule,
    RouterLinkActive,
    MatIcon,
    MatTooltip,
    NgIf
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class AdminLayoutComponent {
  protected readonly accountService = inject(AccountService);
  protected readonly themeService = inject(ThemeService);
}
