import {Component, inject, OnInit} from '@angular/core';
import {OrderService} from '../../core/services/order.service';
import {Order} from '../../shared/models/order';
import {RouterLink} from '@angular/router';
import {CurrencyPipe, DatePipe} from '@angular/common';

@Component({
  selector: 'app-order',
  imports: [
    RouterLink,
    DatePipe,
    CurrencyPipe
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit{
  private readonly orderService = inject(OrderService);
  orders: Order[] = [];

  ngOnInit(): void {
    this.orderService.getOrdersForUser().subscribe({
      next: orders => {
        this.orders = orders;
      },
      error: err => {
        console.error('Error fetching orders:', err);
      }
    });
  }
}
