import { Component } from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {Router, RouterLink} from '@angular/router';
import {MatButton} from "@angular/material/button";
import {MatDivider} from '@angular/material/divider';

@Component({
  selector: 'app-server-error',
  imports: [
    MatButton,
    RouterLink,
    MatDivider
  ],
  templateUrl: './server-error.component.html',
  styleUrl: './server-error.component.scss'
})
export class ServerErrorComponent {
  error?: any;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.error = navigation.extras.state['error'];
    }
  }
}
