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
import {CampParams} from '../../shared/models/params/campParams';
import {FormControl, FormsModule, FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatSelect, MatSelectTrigger} from '@angular/material/select';
import {MatDivider} from '@angular/material/divider';
import {CampsiteTypeService} from '../../core/services/campsite-type.service';
import {CampgroundAmenityService} from '../../core/services/campground-amenities.service';
import {CampgroundAmenity} from '../../shared/models/campgroundAmenity';
import {CampsiteType} from '../../shared/models/campsiteType';
import {BehaviorSubject, catchError, EMPTY, Subscription, merge, debounceTime} from 'rxjs';
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
  protected readonly campgroundAmenityService = inject(CampgroundAmenityService);
  protected readonly campsiteTypeService = inject(CampsiteTypeService);
  protected readonly reservationService = inject(ReservationService);
  private readonly campsiteService = inject(CampsiteService);
  private readonly snackbar = inject(SnackbarService);
  private readonly fb = inject(FormBuilder);
  private campsiteSubscription?: Subscription;
  campsites$ = new BehaviorSubject<Pagination<CampsiteAvailabilityDto> | null>(null);
  searchParamsMatch$ = new BehaviorSubject<boolean>(true);
  loading$ = new BehaviorSubject<boolean>(false);
  campParams = new CampParams();
  pageSizeOptions = [10, 15, 20, 50];
  campsiteTypes = new FormControl([]);
  campgroundAmenities = new FormControl([]);
  campsiteCount: number = 0;
  startDate = new Date();
  endDate = new Date();
  searchStartDate = new Date(); // keep track of the last search start date
  searchEndDate = new Date(); // keep track of the last search end date
  searchForm!: FormGroup;

  ngOnInit() {
    this.initializeForm();
    this.initializeServices();
    this.initializeDateRange();
    this.startNewSearch();
  }

  ngOnDestroy() {
    this.campsiteSubscription?.unsubscribe();
  }

  onSubmit() {
    if (this.searchForm.valid) {
      this.startNewSearch();
    } else {
      this.snackbar.error('Invalid date range.');
    }
  }

  startNewSearch() {
    if (!this.reservationService.datesValid()) {
      this.snackbar.error('Invalid selected dates');
      return;
    }
    this.campParams.pageNumber = 1;
    this.campParams.campsiteTypes = this.searchForm.get('campsiteTypes')?.value || [];
    this.campParams.campgroundAmenities = this.searchForm.get('campgroundAmenities')?.value || [];
    this.searchStartDate = this.reservationService.selectedStartDate();
    this.searchEndDate = this.reservationService.selectedEndDate();
    this.getCampsites(this.searchStartDate, this.searchEndDate);
    setTimeout(() => this.searchParamsMatch$.next(true), 0);
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
        catchError(() => {
          this.snackbar.error('Failed to load campsites. Please try again.');
          this.loading$.next(false);
          return EMPTY;
        })
      )
      .subscribe({
        next: (response) => {
          this.campsites$.next(response);
          this.campsiteCount = response.count;
          this.loading$.next(false);
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
    this.searchForm.get('campsiteTypes')?.setValue([]);
    this.searchForm.get('campgroundAmenities')?.setValue([]);
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

  doSearchParamsMatch(): boolean {
    if (!this.searchForm) return false;

    // Get values from form
    const formCampsiteTypes = this.searchForm.get('campsiteTypes')?.value || [];
    const formAmenities = this.searchForm.get('campgroundAmenities')?.value || [];
    const formStartDate = this.searchForm.get('startDate')?.value;
    const formEndDate = this.searchForm.get('endDate')?.value;

    // Check if arrays have same contents
    const typesMatch = this.arraysEqual(formCampsiteTypes, this.campParams.campsiteTypes);
    const amenitiesMatch = this.arraysEqual(formAmenities, this.campParams.campgroundAmenities);

    // Check if dates match (normalize to remove time components)
    const normalizeDate = (date: Date) =>
      new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

    const datesMatch =
      normalizeDate(formStartDate) === normalizeDate(this.searchStartDate) &&
      normalizeDate(formEndDate) === normalizeDate(this.searchEndDate);

    return typesMatch && amenitiesMatch && datesMatch;
  }

  private arraysEqual(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) return false;
    const sorted1 = [...arr1].sort();
    const sorted2 = [...arr2].sort();
    return sorted1.every((val, idx) => val === sorted2[idx]);
  }

  private initializeForm() {
    this.searchForm = this.fb.group({
      startDate: [this.reservationService.selectedStartDate()],
      endDate: [this.reservationService.selectedEndDate()],
      campsiteTypes: this.campsiteTypes,
      campgroundAmenities: this.campgroundAmenities
    });

    // Update searchParamsMatch$ whenever form values change
    merge(
      this.searchForm.get('startDate')?.valueChanges || EMPTY,
      this.searchForm.get('endDate')?.valueChanges || EMPTY,
      this.searchForm.get('campsiteTypes')?.valueChanges || EMPTY,
      this.searchForm.get('campgroundAmenities')?.valueChanges || EMPTY
    ).pipe(
      debounceTime(50) // Prevent multiple rapid calculations
    ).subscribe(() => {
      this.searchParamsMatch$.next(this.doSearchParamsMatch());
    });

    // Individual subscriptions for date handling
    this.searchForm.get('startDate')?.valueChanges.subscribe(date => {
      this.handleStartDateChange(date);
    });

    this.searchForm.get('endDate')?.valueChanges.subscribe(date => {
      this.handleEndDateChange(date);
    });
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
