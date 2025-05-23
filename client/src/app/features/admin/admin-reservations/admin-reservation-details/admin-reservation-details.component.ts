import {Component, Inject, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {ReservationDto} from '../../../../shared/models/reservationDto';
import {DatePipe} from '@angular/common';
import {ReservationService} from '../../../../core/services/reservation.service';

@Component({
  selector: 'app-admin-reservation-details',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatButton,
    MatDialogActions,
    DatePipe
  ],
  templateUrl: './admin-reservation-details.component.html',
  styleUrl: './admin-reservation-details.component.scss'
})
export class AdminReservationDetailsComponent {
  private readonly dialogRef = inject(MatDialogRef<AdminReservationDetailsComponent>);
  protected readonly reservationService = inject(ReservationService);

  constructor(@Inject(MAT_DIALOG_DATA) public data: {reservation:ReservationDto}) { }

  onCancel() {
    this.dialogRef.close();
  }
}
