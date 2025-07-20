import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {

  handleHttpError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
      console.error('Client-side error:', error.error.message);
    } else {
      // Server-side error
      if (error.error) {
        if (typeof error.error === 'object' && error.error.errors) {
          // Handle validation errors
          const validationErrors = Object.values(error.error.errors).flat();
          errorMessage = Array.isArray(validationErrors) ? validationErrors.join(', ') : String(validationErrors);
        } else if (typeof error.error === 'object' && error.error.message) {
          errorMessage = error.error.message;
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
        }
      } else {
        errorMessage = `Error Code: ${error.status}, Message: ${error.statusText}`;
      }
      console.error('Server-side error:', errorMessage);
    }

    return throwError(() => new Error(errorMessage));
  }
}
