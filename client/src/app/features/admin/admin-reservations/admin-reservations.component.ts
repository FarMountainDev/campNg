import {Component, inject, OnInit} from '@angular/core';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {AdminService} from '../../../core/services/admin.service';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {DatePipe, NgIf} from '@angular/common';
import {MatLabel} from '@angular/material/form-field';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatInput} from '@angular/material/input';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatSort, MatSortHeader, Sort} from '@angular/material/sort';
import {PaginationParams} from '../../../shared/models/params/paginationParams';
import {ReservationDto} from '../../../shared/models/reservationDto';
import {SnackbarService} from '../../../core/services/snackbar.service';
import {ImmediateErrorStateMatcher} from '../../../shared/utils/immediate-error-state-matcher';

@Component({
  selector: 'app-admin-reservations',
  imports: [
    MatIcon,
    MatIconButton,
    MatTooltipModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatLabel,
    MatInput,
    MatButton,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    MatSortHeader,
    MatSort,
    DatePipe
  ],
  templateUrl: './admin-reservations.component.html',
  styleUrl: './admin-reservations.component.scss'
})
export class AdminReservationsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly snackbar = inject(SnackbarService);
  displayedColumns: string[] = ['id', 'email', 'campsiteId', 'campsiteName', 'startDate', 'endDate', 'orderId', 'actions'];
  dataSource = new MatTableDataSource<ReservationDto>([]);
  paginationParams = new PaginationParams();
  totalItems = 0;
  searchForm = new FormGroup({
    searchInput: new FormControl<string>('', [
      Validators.pattern(/^[a-zA-Z0-9._%+-@]*$/)
    ])
  });
  immediateErrorMatcher = new ImmediateErrorStateMatcher();

  ngOnInit() {
    this.loadReservations();
  }

  loadReservations() {
    this.adminService.getReservations(this.paginationParams).subscribe({
      next: response => {
        if (response.data) {
          this.dataSource.data = response.data
          this.totalItems = response.count;
        }
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.paginationParams.pageNumber = event.pageIndex + 1;
    this.paginationParams.pageSize = event.pageSize;
    this.loadReservations();
  }

  onSearch(searchTerm: string) {
    this.paginationParams.search = searchTerm;
    this.paginationParams.pageNumber = 1;
    this.loadReservations();
  }

  onSort(event: Sort) {
    this.paginationParams.sort = event.active;
    this.paginationParams.sortDirection = event.direction;
    this.loadReservations();
  }

  onSubmit() {
    if (this.searchForm.valid) {
      this.paginationParams.search = this.searchForm.controls.searchInput.value!;
      this.paginationParams.pageNumber = 1;
      this.loadReservations();
    }
  }

  onResetFilters() {
    this.paginationParams.pageNumber = 1;
    this.paginationParams.search = '';
    this.searchForm.controls.searchInput.setValue('');
    this.loadReservations();
  }

  onCreateReservation() {
    this.snackbar.warning('Admin reservation creation is not available yet.');
  }
}
