import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {CampsiteService} from '../../core/services/campsite.service';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {AsyncPipe, NgIf} from '@angular/common';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatDatepickerToggle, MatDateRangeInput, MatDateRangePicker} from '@angular/material/datepicker';
import {MatInput} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatOption, provideNativeDateAdapter} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {Pagination} from '../../shared/models/pagination';
import {CampParams} from '../../shared/models/campParams';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSelect, MatSelectTrigger} from '@angular/material/select';
import {MatDivider} from '@angular/material/divider';
import {CampsiteTypeService} from '../../core/services/campsite-type.service';
import {CampgroundAmenityService} from '../../core/services/campground-amenities.service';
import {CampgroundAmenity} from '../../shared/models/campgroundAmenity';
import {CampsiteType} from '../../shared/models/campsiteType';
import {BehaviorSubject, catchError, EMPTY, Subscription} from 'rxjs';
import {CampsiteAvailabilityItemComponent} from './campsite-availability-item/campsite-availability-item.component';
import {ReservationService} from '../../core/services/reservation.service';
import {MAT_DATE_RANGE_SELECTION_STRATEGY} from '@angular/material/datepicker';
import {MaxRangeSelectionStrategy} from '../../shared/strategies/max-date-range-strategy';
import {SnackbarService} from '../../core/services/snackbar.service';
import {CampsiteAvailabilityDto} from '../../shared/models/campsiteAvailabilityDto';

@Component({
  selector: 'app-reservations',
  imports: [
    FormsModule,
    MatButton,
    MatIcon,
    MatPaginator,
    MatProgressSpinner,
    NgIf,
    MatFormField,
    MatDateRangeInput,
    MatDatepickerToggle,
    MatDateRangePicker,
    MatLabel,
    MatInput,
    MatDatepickerModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSelect,
    MatOption,
    MatSelectTrigger,
    MatDivider,
    AsyncPipe,
    CampsiteAvailabilityItemComponent
  ],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.scss',
  providers: [
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: MaxRangeSelectionStrategy
    },
    provideNativeDateAdapter()
  ]
})
export class ReservationsComponent implements OnInit, OnDestroy {
  private readonly campsiteService = inject(CampsiteService);
  private readonly snackbar = inject(SnackbarService);
  protected readonly campgroundAmenityService = inject(CampgroundAmenityService);
  protected readonly campsiteTypeService = inject(CampsiteTypeService);
  protected readonly reservationService = inject(ReservationService);
  private campsiteSubscription?: Subscription;
  campsites$ = new BehaviorSubject<Pagination<CampsiteAvailabilityDto> | null>(null);
  loading$ = new BehaviorSubject<boolean>(false);
  campParams = new CampParams();
  pageSizeOptions = [2, 5, 10, 15, 20];
  campsiteTypes = new FormControl([]);
  campgroundAmenities = new FormControl([]);
  campsiteCount: number = 0;
  startDate = new Date();
  endDate = new Date();
  searchStartDate = new Date(); // keep track of the last search start date
  searchEndDate = new Date(); // keep track of the last search end date

  ngOnInit() {
    this.initializeServices();
    this.initializeDateRange();
    this.startNewSearch();
  }

  ngOnDestroy() {
    this.campsiteSubscription?.unsubscribe();
  }

  startNewSearch() {
    if (!this.reservationService.datesValid() || !this.reservationService.datesValid(this.startDate, this.endDate)) {
      this.snackbar.error('Please select a valid date range.');
      return;
    }
    this.campParams.campsiteTypes = this.campsiteTypes.value || [];
    this.campParams.campgroundAmenities = this.campgroundAmenities.value || [];
    this.searchStartDate = this.reservationService.selectedStartDate();
    this.searchEndDate = this.reservationService.selectedEndDate();
    this.getCampsites(this.searchStartDate, this.searchEndDate);
  }

  getCampsites(startDate: Date, endDate: Date) {
    if (!this.reservationService.datesValid(startDate, endDate)) {
      this.snackbar.error('Please select a valid date range.');
      return;
    }
    this.loading$.next(true);
    this.campsiteSubscription?.unsubscribe();
    this.campsiteSubscription = this.campsiteService.getAvailableCampsites(startDate, endDate, this.campParams)
      .pipe(
        catchError(error => {
          console.error('Error fetching campsites:', error);
          this.snackbar.error('Failed to load campsites. Please try again.');
          this.loading$.next(false);
          return EMPTY;
        })
      )
      .subscribe({
        next: (response) => {
          console.log("response:", response);
          this.campsites$.next(response);
          this.campsiteCount = response.count;
          this.loading$.next(false);
          console.log('campsites$:', this.campsites$);
          console.log("campsiteCount:", this.campsiteCount);
        }
      });
  }

  handleStartDateChange(date: Date) {
    if (!date || date < this.reservationService.minDate || date > this.reservationService.maxDate) {
      return;
    }
    this.reservationService.selectedStartDate.set(date);
  }

  handleEndDateChange(date: Date) {
    if (!date || date < this.reservationService.minDate || date > this.reservationService.maxDate) {
      return;
    }
    this.reservationService.selectedEndDate.set(date);
  }

  handlePageEvent(event: PageEvent) {
    this.campParams.pageNumber = event.pageIndex + 1;
    this.campParams.pageSize = event.pageSize;
    this.getCampsites(this.searchStartDate, this.searchEndDate);
  }

  clearFilters() {
    this.campsiteTypes = new FormControl([]);
    this.campgroundAmenities = new FormControl([]);
    this.campParams.campgroundAmenities = [];
    this.campParams.campsiteTypes = [];
    this.campParams.search = '';
    this.campParams.pageNumber = 1;
    this.startNewSearch();
  }

  getTypeNameById(id: number | null | undefined, types: CampsiteType[]): string {
    if (id === null || id === undefined) return '';
    const type = types.find(t => t.id === id);
    return type ? type.name : '';
  }

  getAmenityNameById(id: number | null | undefined, amenities: CampgroundAmenity[]): string {
    if (id === null || id === undefined) return '';
    const amenity = amenities.find(a => a.id === id);
    return amenity ? amenity.name : '';
  }

  private initializeServices() {
    this.campsiteTypeService.getCampsiteTypes();
    this.campgroundAmenityService.getCampgroundAmenities();
  }

  private initializeDateRange() {
    this.startDate = this.reservationService.selectedStartDate();
    this.endDate = this.reservationService.selectedEndDate();
  }
}
