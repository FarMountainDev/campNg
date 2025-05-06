import {inject, Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {OrderParams} from '../../shared/models/orderParams';
import {Pagination} from '../../shared/models/pagination';
import {Order} from '../../shared/models/order';

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
    params = params.append('pageIndex', orderParams.pageNumber);
    params = params.append('pageSize', orderParams.pageSize);
    return this.http.get<Pagination<Order>>(this.baseUrl + 'admin/orders', {params});
  }

  getOrder(id: number) {
    return this.http.get<Order>(this.baseUrl + 'admin/orders/' + id);
  }

  refundOrder(id: number) {
    return this.http.post<Order>(this.baseUrl + 'admin/orders/refund/' + id, {});
  }
}
