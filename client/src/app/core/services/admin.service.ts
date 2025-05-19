import {inject, Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {OrderParams} from '../../shared/models/orderParams';
import {Pagination} from '../../shared/models/pagination';
import {Order} from '../../shared/models/order';
import {PaginationParams} from '../../shared/models/paginationParams';
import {ReservationDto} from '../../shared/models/reservationDto';
import {OccupancyRate} from '../../shared/models/occupancyRate';
import {MonthlyRevenue} from '../../shared/models/monthlyRevenue';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly baseUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  getOrders(orderParams: OrderParams) {
    let params = new HttpParams();
    if (orderParams.status && orderParams.status !== 'All') {
        params = params.append('status', orderParams.status);
    }
    params = params.append('pageNumber', orderParams.pageNumber);
    params = params.append('pageSize', orderParams.pageSize);
    return this.http.get<Pagination<Order>>(this.baseUrl + 'admin/orders', {params});
  }

  getOrder(id: number) {
    return this.http.get<Order>(this.baseUrl + 'admin/orders/' + id);
  }

  refundOrder(id: number) {
    return this.http.post<Order>(this.baseUrl + 'admin/orders/refund/' + id, {});
  }

  getTodayCheckIns(paginationParams: PaginationParams) {
    let params = new HttpParams();
    params = params.append('pageNumber', paginationParams.pageNumber);
    params = params.append('pageSize', paginationParams.pageSize);
    return this.http.get<Pagination<ReservationDto>>(this.baseUrl + 'admin/check-ins', {params});
  }

  getTodayCheckOuts(paginationParams: PaginationParams) {
    let params = new HttpParams();
    params = params.append('pageNumber', paginationParams.pageNumber);
    params = params.append('pageSize', paginationParams.pageSize);
    return this.http.get<Pagination<ReservationDto>>(this.baseUrl + 'admin/check-outs', {params});
  }

  getTodayOccupancy() {
    return this.http.get<OccupancyRate[]>(this.baseUrl + 'admin/occupancy');
  }

  getMonthlyRevenue() {
    return this.http.get<MonthlyRevenue>(this.baseUrl + 'admin/revenue');
  }

  generateMockReservationDtoData(count: number) {
    const mockData: ReservationDto[] = [];
    const today = new Date();

    for (let i = 1; i <= count; i++) {
      const startDate = new Date(today);
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 3 + Math.floor(Math.random() * 5));

      mockData.push({
        id: i,
        campsiteId: 100 + Math.floor(Math.random() * 50),
        email: `camper${i}@test.com`,
        startDate: startDate,
        endDate: endDate
      });
    }

    return mockData;
  }
}
