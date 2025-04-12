import {inject, Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {CartItem} from '../../shared/models/shoppingCart';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private readonly baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  checkInTime = '2:00 PM';
  checkOutTime = '11:00 AM';

  getNumberOfNights(item: CartItem): number {
    const startDate = new Date(item.startDate);
    const endDate = new Date(item.endDate);

    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays + 1;
  }

  getCheckoutDate(endDate: Date): Date {
    const date = new Date(endDate);
    date.setDate(date.getDate() + 1);
    return date;
  }
}
