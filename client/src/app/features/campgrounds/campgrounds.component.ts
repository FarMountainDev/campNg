import {Component, inject, OnInit} from '@angular/core';
import {CampgroundService} from '../../core/services/campground.service';
import {Campground} from '../../shared/models/campground';
import {Pagination} from '../../shared/models/pagination';
import {CampgroundItemComponent} from './campground-item/campground-item.component';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatIcon} from '@angular/material/icon';
import {FiltersDialogComponent} from './filters-dialog/filters-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {CampParams} from '../../shared/models/params/campParams';
import {MatButton} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {AsyncPipe, NgIf} from '@angular/common';
import {BehaviorSubject, catchError, EMPTY, tap, map} from 'rxjs';

@Component({
  selector: 'app-campgrounds',
  imports: [
    CampgroundItemComponent,
    MatPaginator,
    MatIcon,
    MatButton,
    FormsModule,
    MatProgressSpinner,
    NgIf,
    AsyncPipe
  ],
  templateUrl: './campgrounds.component.html',
  styleUrl: './campgrounds.component.scss'
})
export class CampgroundsComponent implements OnInit {
  private readonly campgroundService = inject(CampgroundService);
  private readonly dialogService = inject(MatDialog);
  campgrounds$ = new BehaviorSubject<Pagination<Campground> | null>(null);
  loading = new BehaviorSubject<boolean>(false);
  campParams = new CampParams();
  pageSizeOptions = [2, 5, 10, 15, 20];
  campgroundCount: number = 0;

  ngOnInit() {
    this.getCampgrounds();
  }

  getCampgrounds() {
    this.loading.next(true);
    this.campgroundService.getCampgrounds(this.campParams).pipe(
      tap(response => {
        this.campgrounds$.next(response);
        this.loading.next(false);
      }),
      map(response => {
        this.campgroundCount = response.count;
      }),
      catchError(error => {
        console.log(error);
        this.loading.next(false);
        return EMPTY;
      })
    ).subscribe();
  }

  onSearchChange() {
    this.campParams.pageNumber = 1;
    this.getCampgrounds();
  }

  handlePageEvent(event: PageEvent) {
    this.campParams.pageNumber = event.pageIndex + 1;
    this.campParams.pageSize = event.pageSize;
    this.getCampgrounds();
  }

  openFiltersDialog() {
    const dialogRef = this.dialogService.open(FiltersDialogComponent, {
      minWidth: '500px',
      data: {
        selectedAmenities: this.campParams.campgroundAmenities,
        selectedTypes: this.campParams.campsiteTypes
      }
    });

    dialogRef.afterClosed().subscribe({
      next: result => {
        if (result) {
          this.campParams.campgroundAmenities = result.selectedAmenities;
          this.campParams.campsiteTypes = result.selectedTypes;
          this.campParams.pageNumber = 1;
          this.getCampgrounds();
        }
      }
    });
  }

  clearFilters() {
    this.campParams.campgroundAmenities = [];
    this.campParams.campsiteTypes = [];
    this.campParams.search = '';
    this.campParams.pageNumber = 1;
    this.getCampgrounds();
  }
}
