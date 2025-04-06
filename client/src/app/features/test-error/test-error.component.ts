import {Component, inject} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-test-error',
  imports: [
    MatButton
  ],
  templateUrl: './test-error.component.html',
  styleUrl: './test-error.component.scss'
})
export class TestErrorComponent {
  baseUrl = 'https://localhost:5001/api/';
  private http = inject(HttpClient);
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
