import {Component, inject, OnInit} from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {AdminService} from '../../../core/services/admin.service';
import {PaginationParams} from '../../../shared/models/paginationParams';
import {DatePipe} from '@angular/common';
import {ReservationDto} from '../../../shared/models/reservationDto';

@Component({
  selector: 'app-dashboard-today-check-ins',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    DatePipe,
  ],
  templateUrl: './dashboard-today-check-ins.component.html',
  styleUrl: './dashboard-today-check-ins.component.scss'
})
export class DashboardTodayCheckInsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  displayedColumns: string[] = ['id', 'campsiteId', 'email', 'startDate', 'endDate'];
  dataSource = new MatTableDataSource<ReservationDto>([]);
  paginationParams = new PaginationParams();
  totalItems = 0;

  ngOnInit() {
    this.loadCheckIns();
  }

  loadCheckIns() {
    this.adminService.getTodayCheckIns(this.paginationParams).subscribe({
      next: response => {
        if (response.data) {
          this.dataSource.data = response.data
          //this.dataSource.data = this.adminService.generateMockReservationDtoData(5);
          this.totalItems = response.count;
        }
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.paginationParams.pageNumber = event.pageIndex + 1;
    this.paginationParams.pageSize = event.pageSize;
    this.loadCheckIns();
  }
}
