import {Component, inject, OnInit} from '@angular/core';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {Order} from '../../../shared/models/order';
import {AdminService} from '../../../core/services/admin.service';
import {OrderParams} from '../../../shared/models/orderParams';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatSelectChange, MatSelectModule} from '@angular/material/select';
import {CurrencyPipe, DatePipe, NgIf} from '@angular/common';
import {MatLabel} from '@angular/material/form-field';
import {MatTooltipModule} from '@angular/material/tooltip';
import {RouterLink} from '@angular/router';
import {DialogService} from '../../../core/services/dialog.service';
import {MatInput} from '@angular/material/input';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatSort, MatSortHeader, Sort} from '@angular/material/sort';

@Component({
  selector: 'app-admin-orders',
  imports: [
    CurrencyPipe,
    DatePipe,
    MatIcon,
    MatIconButton,
    MatTooltipModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatLabel,
    RouterLink,
    MatInput,
    MatButton,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    MatSortHeader,
    MatSort
  ],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss'
})
export class AdminOrdersComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly dialogService = inject(DialogService);
  displayedColumns: string[] = ['id', 'buyerEmail', 'orderDate', 'total', 'status', 'actions'];
  dataSource = new MatTableDataSource<Order>([]);
  orderParams = new OrderParams();
  totalItems = 0;
  statusOptions = ['All', 'PaymentReceived', 'PaymentMismatch', 'Refunded', 'Pending'];
  searchForm = new FormGroup({
    searchInput: new FormControl<string>('', [
      Validators.pattern(/^[a-zA-Z0-9._%+-@]*$/)
    ]),
    orderStatusSelect: new FormControl()
  });

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.adminService.getOrders(this.orderParams).subscribe({
      next: response => {
        if (response.data) {
          this.dataSource.data = response.data
          this.totalItems = response.count;
        }
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.orderParams.pageNumber = event.pageIndex + 1;
    this.orderParams.pageSize = event.pageSize;
    this.loadOrders();
  }

  onFilterSelect(event: MatSelectChange) {
    this.orderParams.status = event.value;
    this.orderParams.pageNumber = 1;
    this.loadOrders();
  }

  onSearch(searchTerm: string) {
    this.orderParams.search = searchTerm;
    this.orderParams.pageNumber = 1;
    this.loadOrders();
  }

  onSort(event: Sort) {
    this.orderParams.sort = event.active;
    this.orderParams.sortDirection = event.direction;
    this.loadOrders();
  }

  onSubmit() {
    if (this.searchForm.valid) {
      this.orderParams.search = this.searchForm.controls.searchInput.value!;
      this.orderParams.status = this.searchForm.controls.orderStatusSelect.value;
      this.orderParams.pageNumber = 1;
      this.loadOrders();
    }
  }

  onResetFilters() {
    this.orderParams.pageNumber = 1;
    this.orderParams.search = '';
    this.orderParams.status = '';
    this.searchForm.controls.searchInput.setValue('');
    this.searchForm.controls.orderStatusSelect.setValue('');
    this.loadOrders();
  }

  async openConfirmDialog(id: number) {
    const confirmed = await this.dialogService.confirm(
      'Confirm refund',
      'Are you sure you want to refund this order? This cannot be undone.'
    )
    if (confirmed) {
      this.refundOrder(id);
    }
  }

  refundOrder(id: number) {
    this.adminService.refundOrder(id).subscribe({
      next: order => {
        this.dataSource.data = this.dataSource.data.map(o => o.id === id ? order : o)
      }
    });
  }
}
