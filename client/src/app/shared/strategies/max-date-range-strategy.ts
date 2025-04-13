import {inject, Injectable} from '@angular/core';
import { DateRange } from '@angular/material/datepicker';
import { MatDateRangeSelectionStrategy } from '@angular/material/datepicker';
import {ReservationService} from '../../core/services/reservation.service';

@Injectable()
export class MaxRangeSelectionStrategy implements MatDateRangeSelectionStrategy<Date> {
  private readonly reservationService = inject(ReservationService);
  private readonly maxRangeDays = this.reservationService.maxDays;

  constructor() {}

  selectionFinished(date: Date | null, currentRange: DateRange<Date>): DateRange<Date> {
    return this.createMaxRangeSelection(date, currentRange);
  }

  createPreview(date: Date | null, currentRange: DateRange<Date>): DateRange<Date> {
    return this.createMaxRangeSelection(date, currentRange);
  }

  private createMaxRangeSelection(date: Date | null, currentRange: DateRange<Date>): DateRange<Date> {
    // If clearing selection
    if (!date) {
      return new DateRange<Date>(null, null);
    }

    // If no start date yet OR if both dates are already set (starting a new selection)
    if (!currentRange.start || (currentRange.start && currentRange.end)) {
      return new DateRange<Date>(date, null);
    }

    // Here we're selecting an end date (start is already set)
    const start = currentRange.start;

    // If selecting end date before start date, swap them
    if (date < start) {
      return new DateRange<Date>(date, start);
    }

    // Calculate difference in days
    const diffTime = date.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // If range exceeds max days, adjust the end date
    if (diffDays > this.maxRangeDays - 1) {
      const adjustedEnd = new Date(start);
      adjustedEnd.setDate(start.getDate() + this.maxRangeDays - 1);
      return new DateRange<Date>(start, adjustedEnd);
    }

    return new DateRange<Date>(start, date);
  }
}
