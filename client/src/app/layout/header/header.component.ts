import { Component } from '@angular/core';
import {MatBadge} from '@angular/material/badge';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [
    MatBadge,
    MatButton,
    MatIcon
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

}
