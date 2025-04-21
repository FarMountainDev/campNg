import {Component, inject, Input, OnChanges} from '@angular/core';
import {CurrencyPipe, DatePipe, NgForOf, NgIf} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {CartService} from '../../../core/services/cart.service';
import {Router} from '@angular/router';
import {ReservationService} from '../../../core/services/reservation.service';
import {CampsiteAvailabilityDto} from '../../../shared/models/campsiteAvailabilityDto';
import { normalizeDate } from '../../../shared/utils/date-utils';

@Component({
  selector: 'app-campsite-availability-item',
  imports: [
    NgIf,
    DatePipe,
    NgForOf,
    MatButton,
    CurrencyPipe
  ],
  templateUrl: './campsite-availability-item.component.html',
  styleUrl: './campsite-availability-item.component.scss'
})
export class CampsiteAvailabilityItemComponent implements OnChanges{
  @Input() campsiteAvailabilityDto?: CampsiteAvailabilityDto;
  @Input() startDate?: Date;
  @Input() endDate?: Date;

  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  private readonly reservationService = inject(ReservationService);

  dateRange: Date[] = [];
  totalPrice: number = 0;

  ngOnChanges(): void {
    this.calculateDateRange();
    this.calculatePrice();
  }

  isDateReserved(date: Date): boolean {
    if (!this.campsiteAvailabilityDto?.reservations?.length) return false;

    const compareDate = normalizeDate(date);

    return this.campsiteAvailabilityDto.reservations.some(reservation => {
      const startDate = normalizeDate(reservation.startDate);
      const endDate = normalizeDate(reservation.endDate);

      return compareDate >= startDate && compareDate <= endDate;
    });
  }

  isDatePending(date: Date) {
    if (!this.campsiteAvailabilityDto?.pendingReservations?.length) return false;

    const compareDate = normalizeDate(date);

    return this.campsiteAvailabilityDto.pendingReservations.some(reservation => {
      const startDate = normalizeDate(reservation.startDate);
      const endDate = normalizeDate(reservation.endDate);

      return compareDate >= startDate && compareDate <= endDate;
    });
  }

  isDateInSelectedRange(date: Date): boolean {
    // If startDate or endDate are not set, date can't be in range
    if (!this.startDate || !this.endDate) return false;

    const checkDate = normalizeDate(date);
    const startDate = normalizeDate(this.startDate);
    const endDate = normalizeDate(this.endDate)

    // Check if date is between start and end dates (inclusive)
    return checkDate >= startDate && checkDate <= endDate;
  }

  addReservationToCart() {
    if (!this.campsiteAvailabilityDto || !this.startDate || !this.endDate) return;

    const cartItem = {
      campsiteId: this.campsiteAvailabilityDto.id,
      campsiteName: this.campsiteAvailabilityDto.name,
      campsiteType: this.campsiteAvailabilityDto.campsiteTypeName,
      campgroundName: this.campsiteAvailabilityDto.campgroundName,
      startDate: normalizeDate(this.startDate),
      endDate: normalizeDate(this.endDate),
      price: this.totalPrice
    };

    this.cartService.addItemToCart(cartItem);
    void this.router.navigate(['/cart']);
  }

  isSelectedRangeUnavailable(): boolean {
    // Return true if any required data is missing
    if (!this.campsiteAvailabilityDto || !this.startDate || !this.endDate) return true;
    if (!this.reservationService.datesValid(this.startDate, this.endDate)) return true;

    const currentDate = normalizeDate(this.startDate);
    const endDate = normalizeDate(this.endDate);

    // Check each date in the range
    while (currentDate <= endDate) {
      if (this.isDateReserved(new Date(currentDate))) {
        return true; // Found a conflict
      }
      if (this.isDatePending(new Date(currentDate))) {
        return true; // Found a conflict
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return false; // No conflicts found
  }

  private calculateDateRange(): void {
    this.dateRange = [];
    console.log('calculating date range with startDate:', this.startDate, 'and endDate:', this.endDate);
    if (!this.startDate) return;

    // Start one day before
    const dayBeforeStartDate = new Date(this.startDate);
    dayBeforeStartDate.setDate(dayBeforeStartDate.getDate() - 1);
    console.log('dayBeforeStartDate:', dayBeforeStartDate);

    // Create 16 days (1 day before + 14 days after startDate + startDate itself)
    for (let i = 0; i < 16; i++) {
      const date = new Date(dayBeforeStartDate);
      date.setDate(date.getDate() + i);
      this.dateRange.push(date);
    }
  }

  private calculatePrice() {
    if (!this.startDate || !this.endDate || !this.campsiteAvailabilityDto)
    {
      this.totalPrice = 0;
      return;
    }

    const weekDayPrice = this.campsiteAvailabilityDto.weekDayPrice;
    const weekEndPrice = this.campsiteAvailabilityDto.weekEndPrice;

    let totalWeekDays = 0;
    let totalWeekEnds = 0;

    const startDate = new Date(this.startDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(this.endDate);
    endDate.setHours(0, 0, 0, 0);

    while (startDate <= endDate) {
      const dayOfWeek = startDate.getDay();
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        // Friday (5) or Saturday (6)
        totalWeekEnds++;
      } else {
        // Sunday (0) to Thursday (4)
        totalWeekDays++;
      }
      startDate.setDate(startDate.getDate() + 1);
    }

    this.totalPrice = (totalWeekDays * weekDayPrice) + (totalWeekEnds * weekEndPrice);
  }
}
