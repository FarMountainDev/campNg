import {inject, Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Campground} from '../../shared/models/campground';
import {Pagination} from '../../shared/models/pagination';
import {CampParams} from '../../shared/models/campParams';

@Injectable({
  providedIn: 'root'
})
export class CampgroundService {
  private readonly baseUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getCampgrounds(campParams: CampParams) {
    let params = new HttpParams();

    if (campParams.campsiteTypes.length > 0)
      params = params.append('campsiteTypes', campParams.campsiteTypes.join(','));

    if (campParams.search)
      params = params.append('search', campParams.search);

    if (campParams.hasHiking)
      params = params.append('hasHiking', campParams.hasHiking);

    if (campParams.hasSwimming)
      params = params.append('hasSwimming', campParams.hasSwimming);

    if (campParams.hasFishing)
      params = params.append('hasFishing', campParams.hasFishing);

    if (campParams.hasShowers)
      params = params.append('hasShowers', campParams.hasShowers);

    if (campParams.hasBoatRentals)
      params = params.append('hasBoatRentals', campParams.hasBoatRentals);

    if (campParams.hasStore)
      params = params.append('hasStore', campParams.hasStore);

    if (campParams.hasWifi)
      params = params.append('hasWifi', campParams.hasWifi);

    if (campParams.allowsPets)
      params = params.append('allowsPets', campParams.allowsPets);

    params = params.append('pageNumber', campParams.pageNumber);
    params = params.append('pageSize', campParams.pageSize);

    return this.http.get<Pagination<Campground>>(this.baseUrl + 'campgrounds', {params});
  }

  getCampground(id: number) {
    return this.http.get<Campground>(this.baseUrl + 'campgrounds/' + id);
  }
}
