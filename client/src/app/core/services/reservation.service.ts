import {computed, Injectable, signal} from '@angular/core';
import {CartItem} from '../../shared/models/shoppingCart';
import {getDateFromDateOnlyString, normalizeDate} from '../../shared/utils/date-utils';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  minDate = normalizeDate(new Date());
  maxDate = (() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return normalizeDate(date);
  })();
  maxDays = 14;
  checkInTime = '2:00 PM';
  checkOutTime = '11:00 AM';
  selectedStartDate = signal<Date>(new Date());
  selectedEndDate = signal<Date>(new Date());
  selectedNumberOfNights = computed<number>(() => {
    const startDate = this.selectedStartDate();
    const endDate = this.selectedEndDate();
    if (!startDate || !endDate) return 0;

    return this.getNumberOfNights(startDate, endDate);
  });

  constructor() {
    this.setToNextWeekend();
  }

  getNumberOfNightsForCartItem(item: CartItem): number {
    const startDateString = item.startDate.toString();
    const endDateString = item.endDate.toString();

    const startDate = getDateFromDateOnlyString(startDateString);
    const endDate = getDateFromDateOnlyString(endDateString);

    return this.getNumberOfNights(startDate, endDate);
  }

  getNumberOfNights(startDate: Date, endDate: Date): number {
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  }

  getCheckoutDate(endDate: Date): Date {
    const date = new Date(endDate);
    date.setDate(date.getDate() + 1);
    return date;
  }

  datesValid(startDate: Date = this.selectedStartDate(), endDate: Date = this.selectedEndDate()): boolean {
    if (!startDate || !endDate) return false;
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;

    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    if (start > end) return false;

    return this.rangeWithinMaximumLimit(start, end);
  }

  rangeWithinMaximumLimit(startDate: Date, endDate: Date) {
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    const maxDays = this.maxDays;

    return diffDays <= maxDays;
  }

  private setToNextWeekend() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday ...

    // Calculate days until next Friday
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    // If today is Friday, we want next Friday, not today
    const daysToAdd = daysUntilFriday === 0 ? 7 : daysUntilFriday;

    // Set start date to next Friday
    const nextFriday = new Date();
    nextFriday.setDate(today.getDate() + daysToAdd);
    this.selectedStartDate.set(nextFriday);

    // Set end date to next Sunday
    const nextSunday = new Date(nextFriday);
    nextSunday.setDate(nextFriday.getDate() + 2);
    this.selectedEndDate.set(nextSunday);
  }
}
