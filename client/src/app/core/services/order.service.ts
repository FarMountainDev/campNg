import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Order, OrderToCreate } from '../../shared/models/order';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly baseUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);
  orderComplete = false;

  createOrder(orderToCreate: OrderToCreate) {
    return this.http.post<Order>(this.baseUrl + 'orders', orderToCreate)
      .pipe(
        catchError(this.handleError)
      );
  }

  getOrdersForUser() {
    return this.http.get<Order[]>(this.baseUrl + 'orders')
      .pipe(
        catchError(this.handleError)
      );
  }

  getOrderDetails(id: number) {
    return this.http.get<Order>(this.baseUrl + 'orders/' + id)
      .pipe(
        catchError(this.handleError)
      );
  }

  // TODO : Create error handling service?
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
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
    }

    return throwError(() => new Error(errorMessage));
  }
}
