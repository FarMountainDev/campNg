import {Component, inject, OnInit} from '@angular/core';
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
import {Campsite} from '../../shared/models/campsite';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSelect, MatSelectTrigger} from '@angular/material/select';
import {MatDivider} from '@angular/material/divider';
import {CampsiteTypeService} from '../../core/services/campsite-type.service';
import {CampgroundAmenityService} from '../../core/services/campground-amenities.service';
import {CampgroundAmenity} from '../../shared/models/campgroundAmenity';
import {CampsiteType} from '../../shared/models/campsiteType';
import {BehaviorSubject, catchError, EMPTY, tap, map} from 'rxjs';
import {CampsiteAvailabilityItemComponent} from './campsite-availability-item/campsite-availability-item.component';

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
  providers: [provideNativeDateAdapter()]
})
export class ReservationsComponent implements OnInit {
  private readonly campsiteService = inject(CampsiteService);
  readonly campsiteTypeService = inject(CampsiteTypeService);
  readonly campgroundAmenityService = inject(CampgroundAmenityService);
  campsites$ = new BehaviorSubject<Pagination<Campsite> | null>(null);
  loading$ = new BehaviorSubject<boolean>(false);
  startDate: Date = new Date();
  endDate: Date = new Date();
  campParams = new CampParams();
  pageSizeOptions = [2, 5, 10, 15, 20];
  minDate = new Date();
  maxDate = new Date();
  campsiteTypes = new FormControl([]);
  campgroundAmenities = new FormControl([]);
  campsiteCount: number = 0;
  searchStartDate: Date = new Date();
  searchEndDate: Date = new Date();

  ngOnInit() {
    this.initializeServices();
    this.initializeDateRange();
    this.getCampsites();
  }

  getCampsites() {
    this.loading$.next(true);
    this.campParams.campsiteTypes = this.campsiteTypes.value || [];
    this.campParams.campgroundAmenities = this.campgroundAmenities.value || [];
    this.searchStartDate = this.startDate;
    this.searchEndDate = this.endDate;

    this.campsiteService.getAvailableCampsites(this.startDate, this.endDate, this.campParams).pipe(
      tap(response => {
        this.campsites$.next(response);
        this.loading$.next(false);
      }),
      map(response => {
        this.campsiteCount = response.count;
      }),
      catchError(error => {
        console.log(error);
        this.loading$.next(false);
        return EMPTY;
      })
    ).subscribe();
  }

  handlePageEvent(event: PageEvent) {
    this.campParams.pageNumber = event.pageIndex + 1;
    this.campParams.pageSize = event.pageSize;
    this.getCampsites();
  }

  clearFilters() {
    this.campsiteTypes = new FormControl([]);
    this.campgroundAmenities = new FormControl([]);
    this.campParams.campgroundAmenities = [];
    this.campParams.campsiteTypes = [];
    this.campParams.search = '';
    this.campParams.pageNumber = 1;
    this.getCampsites();
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
    this.minDate = new Date();
    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear() + 1);
    this.setToNextWeekend();
  }

  private setToNextWeekend() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday ...

    // Calculate days until next Friday
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    // If today is Friday, we want next Friday, not today
    const daysToAdd = daysUntilFriday === 0 ? 7 : daysUntilFriday;

    // Set start date to next Friday
    this.startDate = new Date(today);
    this.startDate.setDate(today.getDate() + daysToAdd);

    // Set end date to next Sunday
    this.endDate = new Date(this.startDate);
    this.endDate.setDate(this.startDate.getDate() + 2);
  }
}
