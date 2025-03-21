import {Component, inject, OnInit} from '@angular/core';
import {CampgroundService} from '../../core/services/campground.service';
import {Campground} from '../../shared/models/campground';
import {Pagination} from '../../shared/models/pagination';
import {CampgroundItemComponent} from './campground-item/campground-item.component';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatIcon} from '@angular/material/icon';
import {FiltersDialogComponent} from './filters-dialog/filters-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {CampParams} from '../../shared/models/campParams';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-campgrounds',
  imports: [
    CampgroundItemComponent,
    MatPaginator,
    MatIcon,
    MatButton
  ],
  templateUrl: './campgrounds.component.html',
  styleUrl: './campgrounds.component.scss'
})
export class CampgroundsComponent implements OnInit {
  private campgroundService = inject(CampgroundService);
  private dialogService = inject(MatDialog);
  campgrounds?: Pagination<Campground>;
  campParams = new CampParams();
  pageSizeOptions = [2, 5, 10, 15, 20];

  ngOnInit() {
    this.getCampgrounds();
  }

  getCampgrounds() {
    this.campgroundService.getCampgrounds(this.campParams).subscribe({
      next: response => this.campgrounds = response,
      error: error => console.log(error)
    });
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
        hasHiking: this.campParams.hasHiking,
        hasSwimming: this.campParams.hasSwimming,
        hasFishing: this.campParams.hasFishing,
        hasShowers: this.campParams.hasShowers,
        hasBoatRentals: this.campParams.hasBoatRentals,
        hasStore: this.campParams.hasStore,
        hasWifi: this.campParams.hasWifi,
        allowsPets: this.campParams.allowsPets
      }
    });

    dialogRef.afterClosed().subscribe({
      next: result => {
        if (result) {
          console.log(result);
          this.campParams.hasHiking = result.hasHiking;
          this.campParams.hasSwimming = result.hasSwimming;
          this.campParams.hasFishing = result.hasFishing;
          this.campParams.hasShowers = result.hasShowers;
          this.campParams.hasBoatRentals = result.hasBoatRentals;
          this.campParams.hasStore = result.hasStore;
          this.campParams.hasWifi = result.hasWifi;
          this.campParams.allowsPets = result.allowsPets;
          this.campParams.pageNumber = 1;
          this.getCampgrounds();
        }
      }
    });
  }

  clearFilters() {
    this.campParams.hasHiking = null;
    this.campParams.hasSwimming = null;
    this.campParams.hasFishing = null;
    this.campParams.hasShowers = null;
    this.campParams.hasBoatRentals = null;
    this.campParams.hasStore = null;
    this.campParams.hasWifi = null;
    this.campParams.allowsPets = null;
    this.campParams.pageNumber = 1;
    this.getCampgrounds();
  }
}
