import {inject, Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  private readonly snackbar = inject(MatSnackBar);
  private readonly defaultDuration = 5000;
  private readonly horizontalPosition: 'start' | 'center' | 'end' | 'left' | 'right' = 'left';
  private readonly verticalPosition: 'top' | 'bottom' = 'bottom';

  info(message: string) {
    this.snackbar.open(message, 'Close', {
      duration: this.defaultDuration,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: ['snackbar-info']
    });
  }

  success(message: string) {
    this.snackbar.open(message, 'Close', {
      duration: this.defaultDuration,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: ['snackbar-success']
    });
  }

  warn(message: string) {
    this.snackbar.open(message, 'Close', {
      duration: this.defaultDuration,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: ['snackbar-warning']
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
