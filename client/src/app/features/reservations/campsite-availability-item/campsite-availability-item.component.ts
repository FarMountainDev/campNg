import {Component, inject, Input, OnChanges, ChangeDetectionStrategy} from '@angular/core';
import {CurrencyPipe, DatePipe, NgForOf, NgIf, NgClass} from '@angular/common';
import {CartService} from '../../../core/services/cart.service';
import {Router} from '@angular/router';
import {ReservationService} from '../../../core/services/reservation.service';
import {CampsiteAvailabilityDto} from '../../../shared/models/campsiteAvailabilityDto';
import { normalizeDate } from '../../../shared/utils/date-utils';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-campsite-availability-item',
  imports: [
    NgIf,
    DatePipe,
    NgForOf,
    CurrencyPipe,
    MatTooltip,
    NgClass
  ],
  templateUrl: './campsite-availability-item.component.html',
  styleUrl: './campsite-availability-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampsiteAvailabilityItemComponent implements OnChanges{
  @Input() campsiteAvailabilityDto?: CampsiteAvailabilityDto;
  @Input() startDate?: Date;
  @Input() endDate?: Date;

  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  protected readonly reservationService = inject(ReservationService);

  dateRange: Date[] = [];
  totalPrice: number = 0;

  ngOnChanges(): void {
    this.calculateDateRange();
    this.calculatePrice();
  }

  isDateReserved(date: Date): boolean {
    return this.checkDateInRange(date, this.campsiteAvailabilityDto?.reservations || []);
  }

  isDatePending(date: Date): boolean {
    return this.checkDateInRange(date, this.campsiteAvailabilityDto?.pendingReservations || []);
  }

  isDateInSelectedRange(date: Date): boolean {
    if (!this.startDate || !this.endDate) return false;

    const checkDate = normalizeDate(date);
    const startDate = normalizeDate(this.startDate);
    const endDate = normalizeDate(this.endDate)

    return checkDate >= startDate && checkDate <= endDate;
  }

  getDateCellClass(date: Date): string {
    const isSelected = this.isDateInSelectedRange(date);
    const isReserved = this.isDateReserved(date);
    const isPending = this.isDatePending(date);

    if (isReserved && isSelected) return 'selectedReserved';
    if (isPending && isSelected) return 'selectedPending';
    if (!isReserved && !isPending && isSelected) return 'selectedAvailable';
    if (isReserved) return 'reserved';
    if (isPending) return 'pending';
    return 'available';
  }

  getSelectedRangeClass(date: Date): string {
    const isSelected = this.isDateInSelectedRange(date);
    if (isSelected) {
      if (this.isDateReserved(date) || this.isDatePending(date)) {
        return 'selected-unavailable';
      }
      return 'selected-available';
    }
    return '';
  }

  addReservationToCart() {
    if (!this.campsiteAvailabilityDto || !this.startDate || !this.endDate) return;

    const cartItem = {
      campsiteId: this.campsiteAvailabilityDto.id,
      campgroundId: this.campsiteAvailabilityDto.campgroundId,
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

  getTooltipText() {
    if (this.isSelectedRangeUnavailable()) {
      return "Unavailable for selected dates. Hit the search button to refresh available campsites or select different dates.";
    }
    return undefined;
  }

  getDateAvailabilityCode(date: Date): string {
    const dateStr = date.toLocaleDateString();
    if (this.isDateReserved(date)) {
      return 'R';
    } else if (this.isDatePending(date)) {
      return 'P';
    } else {
      return 'A';
    }
  }

  getDateAvailabilityLabel(date: Date): string {
    const dateStr = date.toLocaleDateString();
    const status = this.isDateReserved(date) ? 'Reserved' :
      this.isDatePending(date) ? 'Pending' : 'Available';
    const selected = this.isDateInSelectedRange(date) ? ', selected' : '';
    return `${dateStr}: ${status}${selected}`;
  }

  private checkDateInRange(date: Date, reservations: any[]): boolean {
    if (!reservations?.length) return false;
    const compareDate = normalizeDate(date);

    return reservations.some(reservation => {
      const startDate = normalizeDate(reservation.startDate);
      const endDate = normalizeDate(reservation.endDate);
      return compareDate >= startDate && compareDate <= endDate;
    });
  }

  private cachedDateRange: { startDate?: Date, dateRange: Date[] } = { dateRange: [] };

  private calculateDateRange(): void {
    // Skip calculation if we already have a cached result for this start date
    if (this.startDate &&
      this.cachedDateRange.startDate &&
      this.cachedDateRange.startDate.getTime() === this.startDate.getTime()) {
      this.dateRange = [...this.cachedDateRange.dateRange];
      return;
    }

    // Reset date range
    this.dateRange = [];
    if (!this.startDate) return;

    // Start one day before
    const dayBeforeStartDate = new Date(this.startDate);
    dayBeforeStartDate.setDate(dayBeforeStartDate.getDate() - 1);

    // Create 16 days (1 day before + 14 days after startDate + startDate itself)
    for (let i = 0; i < 16; i++) {
      const date = new Date(dayBeforeStartDate);
      date.setDate(date.getDate() + i);
      this.dateRange.push(date);
    }

    // Cache the newly calculated results
    this.cachedDateRange = {
      startDate: this.startDate ? new Date(this.startDate) : undefined,
      dateRange: [...this.dateRange]
    };
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
