import {Component, inject, OnInit, DestroyRef, signal, ChangeDetectionStrategy} from '@angular/core';
import {CampsiteService} from '../../core/services/campsite.service';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {AsyncPipe, NgIf, NgTemplateOutlet} from '@angular/common';
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
import {catchError, EMPTY, distinctUntilChanged, debounceTime} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
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
    CampsiteAvailabilityItemComponent,
    NgTemplateOutlet
  ],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.scss',
  providers: [
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: MaxRangeSelectionStrategy
    },
    provideNativeDateAdapter()
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReservationsComponent implements OnInit {
  protected readonly campgroundAmenityService = inject(CampgroundAmenityService);
  protected readonly campsiteTypeService = inject(CampsiteTypeService);
  protected readonly reservationService = inject(ReservationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly campsiteService = inject(CampsiteService);
  private readonly snackbar = inject(SnackbarService);
  private readonly fb = inject(FormBuilder);
  loading = signal(false);
  searchParamsMatch = signal(true);
  campsites = signal<Pagination<CampsiteAvailabilityDto> | null>(null);
  campsiteCount = signal<number>(0);
  campParams = new CampParams();
  pageSizeOptions = [10, 15, 20, 50];
  campsiteTypes = new FormControl([]);
  campgroundAmenities = new FormControl([]);
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
    this.searchParamsMatch.set(true);
  }

  getCampsites(startDate: Date, endDate: Date) {
    this.loading.set(true);
    this.campsiteService.getAvailableCampsites(startDate, endDate, this.campParams)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => {
          this.snackbar.error('Failed to load campsites. Please try again.');
          this.loading.set(false);
          return EMPTY;
        })
      )
      .subscribe({
        next: (response) => {
          this.campsites.set(response);
          this.campsiteCount.set(response.count);
          this.loading.set(false);
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

    const typesMatch = this.arraysEqual(formCampsiteTypes, this.campParams.campsiteTypes);
    const amenitiesMatch = this.arraysEqual(formAmenities, this.campParams.campgroundAmenities);
    const datesMatch = formStartDate === this.searchStartDate && formEndDate === this.searchEndDate;

    return typesMatch && amenitiesMatch && datesMatch;
  }

  private arraysEqual(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) return false;
    return JSON.stringify([...arr1].sort()) === JSON.stringify([...arr2].sort());
  }

  private initializeForm() {
    this.searchForm = this.fb.group({
      startDate: [this.reservationService.selectedStartDate()],
      endDate: [this.reservationService.selectedEndDate()],
      campsiteTypes: this.campsiteTypes,
      campgroundAmenities: this.campgroundAmenities
    });

    const startDateControl = this.searchForm.get('startDate');
    const endDateControl = this.searchForm.get('endDate');

    if (startDateControl) {
      startDateControl.valueChanges.pipe(
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(date => {
        this.handleStartDateChange(date);
      });
    }

    if (endDateControl) {
      endDateControl.valueChanges.pipe(
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(date => {
        this.handleEndDateChange(date);
      });
    }

    // Only compute searchParamsMatch$ after user stops interacting
    this.searchForm.valueChanges.pipe(
      debounceTime(50),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.searchParamsMatch.set(this.doSearchParamsMatch());
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
