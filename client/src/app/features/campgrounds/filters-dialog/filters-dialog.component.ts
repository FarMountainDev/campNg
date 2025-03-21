import {Component, inject} from '@angular/core';
import {MatDivider} from '@angular/material/divider';
import {MatListOption, MatSelectionList} from '@angular/material/list';
import {FormsModule} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';

@Component({
  selector: 'app-filters-dialog',
  imports: [
    MatDivider,
    MatSelectionList,
    MatListOption,
    FormsModule,
    MatButton,
    MatCheckbox
  ],
  templateUrl: './filters-dialog.component.html',
  styleUrl: './filters-dialog.component.scss'
})
export class FiltersDialogComponent {
  private dialogRef = inject(MatDialogRef<FiltersDialogComponent>);
  data = inject(MAT_DIALOG_DATA);
  hasHiking: boolean = this.data.hasHiking;
  hasSwimming: boolean = this.data.hasSwimming;
  hasFishing: boolean = this.data.hasFishing;
  hasShowers: boolean = this.data.hasShowers;
  hasBoatRentals: boolean = this.data.hasBoatRentals;
  hasStore: boolean = this.data.hasStore;
  hasWifi: boolean = this.data.hasWifi;
  allowsPets: boolean = this.data.allowsPets;

  applyFilters() {
    this.dialogRef.close({
      hasHiking: this.hasHiking,
      hasSwimming: this.hasSwimming,
      hasFishing: this.hasFishing,
      hasShowers: this.hasShowers,
      hasBoatRentals: this.hasBoatRentals,
      hasStore: this.hasStore,
      hasWifi: this.hasWifi,
      allowsPets: this.allowsPets
    })
  }
}
