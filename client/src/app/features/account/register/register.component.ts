import {Component, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatCard} from '@angular/material/card';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {AccountService} from '../../../core/services/account.service';
import {Router} from '@angular/router';
import {SnackbarService} from '../../../core/services/snackbar.service';
import {JsonPipe} from '@angular/common';
import {TextInputComponent} from '../../../shared/components/text-input/text-input.component';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    MatCard,
    MatButton,
    TextInputComponent,
    MatIcon
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  protected readonly fb = inject(FormBuilder);
  protected readonly accountService = inject(AccountService);
  protected readonly router = inject(Router);
  protected readonly snackbar = inject(SnackbarService);
  validationErrors?: string[];

  registerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmit() {
    this.accountService.register(this.registerForm.value).subscribe({
      next: () => {
        this.snackbar.success('Registration successful. You can now log in.');
        void this.router.navigateByUrl('/account/login');
      },
      error: errors => {
        if (Array.isArray(errors) && errors.every(error => typeof error === 'string')) {
          this.validationErrors = errors;
        } else {
          this.validationErrors = ['An unexpected error occurred during registration. Please try again later.'];
        }
      }
    })
  }
}
