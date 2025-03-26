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
import {MatButton, MatIconButton} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-campgrounds',
  imports: [
    CampgroundItemComponent,
    MatPaginator,
    MatIcon,
    MatButton,
    FormsModule,
    MatIconButton,
    MatProgressSpinner,
    NgIf
  ],
  templateUrl: './campgrounds.component.html',
  styleUrl: './campgrounds.component.scss'
})
export class CampgroundsComponent implements OnInit {
  private readonly campgroundService = inject(CampgroundService);
  private readonly dialogService = inject(MatDialog);
  campgrounds?: Pagination<Campground>;
  campParams = new CampParams();
  pageSizeOptions = [2, 5, 10, 15, 20];
  loading = false;

  ngOnInit() {
    this.getCampgrounds();
  }

  getCampgrounds() {
    this.loading = true;
    this.campgrounds = undefined;
    this.campgroundService.getCampgrounds(this.campParams).subscribe({
      next: response => this.campgrounds = response,
      error: error => console.log(error),
      complete: () => this.loading = false,
    });
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
