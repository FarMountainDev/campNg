import {inject, Injectable, signal} from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Order, OrderToCreate } from '../../shared/models/order';
import { catchError } from 'rxjs';
import { ErrorHandlingService } from './error-handling.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly baseUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);
  private readonly errorHandler = inject(ErrorHandlingService);
  private currentOrderId = signal<number | null>(null);
  orderComplete = false;

  createOrder(orderToCreate: OrderToCreate) {
    return this.http.post<Order>(this.baseUrl + 'orders', orderToCreate)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  getOrdersForUser() {
    return this.http.get<Order[]>(this.baseUrl + 'orders')
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  getOrderDetails(id: number) {
    return this.http.get<Order>(this.baseUrl + 'orders/' + id)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  setCurrentOrderId(orderId: number) {
    this.currentOrderId.set(orderId);
  }

  getCurrentOrderId() {
    return this.currentOrderId();
  }

  clearCurrentOrderId() {
    this.currentOrderId.set(null);
  }
}
