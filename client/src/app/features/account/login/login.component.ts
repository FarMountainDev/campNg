import {Component, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {MatCard} from '@angular/material/card';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {AccountService} from '../../../core/services/account.service';
import {ActivatedRoute, Router} from '@angular/router';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatCard,
    MatFormField,
    MatInput,
    MatLabel,
    MatButton,
    MatIcon
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly accountService = inject(AccountService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  returnUrl = '/reservations';

  constructor() {
    const url = this.activatedRoute.snapshot.queryParams['returnUrl'];
    if (url) this.returnUrl = url;
  }

  loginForm = this.fb.group({
    email: [''],
    password: ['']
  });

  onSubmit() {
    this.accountService.login(this.loginForm.value).subscribe({
      next: () => {
        this.accountService.getUserInfo().subscribe();
        void this.router.navigateByUrl(this.returnUrl);
      }
    });
  }

  loginAsModerator() {
    this.loginForm.patchValue({
      email: 'moderator@campNg.com',
      password: 'Pa$$w0rd'
    });
    this.onSubmit();
  }

  loginAsCamper() {
    this.loginForm.patchValue({
      email: 'HappyCamper@campNg.com',
      password: 'Pa$$w0rd'
    });
    this.onSubmit();
  }
}
