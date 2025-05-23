import {Component, inject, OnInit} from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {AdminService} from '../../../core/services/admin.service';
import {PaginationParams} from '../../../shared/models/params/paginationParams';
import {DatePipe} from '@angular/common';
import {ReservationDto} from '../../../shared/models/reservationDto';
import {DialogService} from '../../../core/services/dialog.service';

@Component({
  selector: 'app-dashboard-today-check-outs',
    imports: [
      MatTableModule,
      MatPaginatorModule,
      DatePipe,
    ],
  templateUrl: './dashboard-today-check-outs.component.html',
  styleUrl: './dashboard-today-check-outs.component.scss'
})
export class DashboardTodayCheckOutsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly dialogService = inject(DialogService);
  displayedColumns: string[] = ['id', 'campsite', 'email', 'startDate', 'endDate'];
  dataSource = new MatTableDataSource<ReservationDto>([]);
  paginationParams = new PaginationParams();
  totalItems = 0;

  ngOnInit() {
    this.loadCheckOuts();
  }

  loadCheckOuts() {
    this.adminService.getTodayCheckOuts(this.paginationParams).subscribe({
      next: response => {
        if (response.data) {
          this.dataSource.data = response.data
          //this.dataSource.data = this.adminService.generateMockReservationDtoData(10);
          this.totalItems = response.count;
        }
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.paginationParams.pageNumber = event.pageIndex + 1;
    this.paginationParams.pageSize = event.pageSize;
    this.loadCheckOuts();
  }

  openReservationDetailsDialog(reservation: ReservationDto) {
    this.dialogService.openAdminReservationDetails(reservation);
  }
}
