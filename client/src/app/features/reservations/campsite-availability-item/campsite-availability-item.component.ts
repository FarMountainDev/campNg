import {Component, inject, Input, OnChanges} from '@angular/core';
import {Campsite} from '../../../shared/models/campsite';
import {CurrencyPipe, DatePipe, NgForOf, NgIf} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {CartService} from '../../../core/services/cart.service';
import {Router} from '@angular/router';

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
  @Input() campsite?: Campsite;
  @Input() startDate?: Date;
  @Input() endDate?: Date;

  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);

  dateRange: Date[] = [];
  totalPrice: number = 0;

  ngOnChanges(): void {
    this.calculateDateRange();
    this.calculatePrice();
  }

  isDateReserved(date: Date): boolean {
    if (!this.campsite || !this.campsite.reservations) return false;

    // Normalize the check date to midnight for comparison
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    const checkTime = checkDate.getTime();

    // Check if date falls within any reservation period
    return this.campsite.reservations.some(reservation => {
      // Get start and end dates from reservation
      const startDate = new Date(reservation.startDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(reservation.endDate);
      endDate.setHours(0, 0, 0, 0);

      // Check if the date is between start and end dates (inclusive)
      return checkTime >= startDate.getTime() && checkTime <= endDate.getTime();
    });
  }

  isDateInSelectedRange(date: Date): boolean {
    // If startDate or endDate are not set, date can't be in range
    if (!this.startDate || !this.endDate) return false;

    // Normalize all dates to midnight for date-only comparison
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    const checkTime = checkDate.getTime();

    const startDate = new Date(this.startDate);
    startDate.setHours(0, 0, 0, 0);
    const startTime = startDate.getTime();

    const endDate = new Date(this.endDate);
    endDate.setHours(0, 0, 0, 0);
    const endTime = endDate.getTime();

    // Check if date is between start and end dates (inclusive)
    return checkTime >= startTime && checkTime <= endTime;
  }

  addReservationToCart() {
    if (!this.campsite || !this.startDate || !this.endDate) return;

    const cartItem = {
      campsiteId: this.campsite.id,
      campsiteName: this.campsite.name,
      campsiteType: this.campsite.campsiteType.name,
      campgroundName: this.campsite.campground.name,
      startDate: this.startDate,
      endDate: this.endDate,
      price: this.totalPrice
    };

    this.cartService.addItemToCart(cartItem);
    this.router.navigate(['/cart']);
  }

  private calculateDateRange(): void {
    this.dateRange = [];
    if (!this.startDate) return;

    // Start one day before
    const startDate = new Date(this.startDate);
    startDate.setDate(startDate.getDate() - 1);

    // Create 16 days (1 day before + 14 days after startDate + startDate itself)
    for (let i = 0; i < 16; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      this.dateRange.push(date);
    }
  }

  private calculatePrice() {
    if (!this.startDate || !this.endDate || !this.campsite)
    {
      this.totalPrice = 0;
      return;
    }

    const weekDayPrice = this.campsite.campsiteType.weekDayPrice;
    const weekEndPrice = this.campsite.campsiteType.weekEndPrice;

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
