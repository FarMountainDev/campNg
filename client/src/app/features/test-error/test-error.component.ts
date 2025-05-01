import {Component, inject} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-test-error',
  imports: [
    MatButton
  ],
  templateUrl: './test-error.component.html',
  styleUrl: './test-error.component.scss'
})
export class TestErrorComponent {
  private readonly baseUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);
  validationErrors?: string[];

  get404Error() {
    this.validationErrors = undefined;
    this.http.get(this.baseUrl + 'errorTest/notfound').subscribe({
      next: response => console.log(response),
      error: error => console.log(error)
    })
  }

  get400Error() {
    this.validationErrors = undefined;
    this.http.get(this.baseUrl + 'errorTest/badrequest').subscribe({
      next: response => console.log(response),
      error: error => console.log(error)
    })
  }

  get401Error() {
    this.validationErrors = undefined;
    this.http.get(this.baseUrl + 'errorTest/unauthorized').subscribe({
      next: response => console.log(response),
      error: error => console.log(error)
    })
  }

  get500Error() {
    this.validationErrors = undefined;
    this.http.get(this.baseUrl + 'errorTest/internalerror').subscribe({
      next: response => console.log(response),
      error: error => console.log(error)
    })
  }

  getValidationError() {
    this.validationErrors = undefined;
    this.http.post(this.baseUrl + 'errorTest/validationerror', {}).subscribe({
      next: response => console.log(response),
      error: error => this.validationErrors = error
    })
  }
}
