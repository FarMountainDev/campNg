import {Component, Input, OnChanges} from '@angular/core';
import {Campsite} from '../../../shared/models/campsite';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-campsite-availability-item',
  imports: [
    NgIf,
    DatePipe,
    NgForOf,
    MatButton
  ],
  templateUrl: './campsite-availability-item.component.html',
  styleUrl: './campsite-availability-item.component.scss'
})
export class CampsiteAvailabilityItemComponent implements OnChanges{
  @Input() campsite?: Campsite;
  @Input() startDate?: Date;
  @Input() endDate?: Date;

  dateRange: Date[] = [];

  ngOnChanges(): void {
    this.calculateDateRange();
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
}
