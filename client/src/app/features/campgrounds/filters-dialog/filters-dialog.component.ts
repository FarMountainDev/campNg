import {Component, inject, OnInit} from '@angular/core';
import {MatDivider} from '@angular/material/divider';
import {MatListOption, MatSelectionList} from '@angular/material/list';
import {FormsModule} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {CampsiteTypeService} from '../../../core/services/campsite-type.service';
import {CampgroundAmenityService} from '../../../core/services/campground-amenities.service';

@Component({
  selector: 'app-filters-dialog',
  imports: [
    MatDivider,
    MatSelectionList,
    MatListOption,
    FormsModule,
    MatButton
  ],
  templateUrl: './filters-dialog.component.html',
  styleUrl: './filters-dialog.component.scss'
})
export class FiltersDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<FiltersDialogComponent>);
  readonly campgroundAmenityService = inject(CampgroundAmenityService);
  readonly campsiteTypeService = inject(CampsiteTypeService);
  data = inject(MAT_DIALOG_DATA);
  selectedAmenities: number[] = this.data.selectedAmenities;
  selectedTypes: number[] = this.data.selectedTypes;

  ngOnInit() {
    this.initializeFilterOptions();
  }

  initializeFilterOptions() {
    this.campgroundAmenityService.getCampgroundAmenities();
    this.campsiteTypeService.getCampsiteTypes();
  }

  applyFilters() {
    this.dialogRef.close({
      selectedAmenities: this.selectedAmenities,
      selectedTypes: this.selectedTypes
    })
  }
}
