import {inject, Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  private readonly snackbar = inject(MatSnackBar);
  private readonly defaultDuration = 5000;
  private readonly horizontalPosition: 'start' | 'center' | 'end' | 'left' | 'right' = 'right';
  private readonly verticalPosition: 'top' | 'bottom' = 'top';

  success(message: string) {
    this.snackbar.open(message, 'Close', {
      duration: this.defaultDuration,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: ['snackbar-success']
    });
  }

  error(message: string) {
    this.snackbar.open(message, 'Close', {
      duration: this.defaultDuration,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: ['snackbar-error']
    });
  }
}
