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
  private readonly http = inject(HttpClient);

  getCampgrounds(campParams: CampParams) {
    let params = new HttpParams();

    if (campParams.campgroundAmenities.length > 0)
      params = params.append('campgroundAmenities', campParams.campgroundAmenities.join(','));

    if (campParams.campsiteTypes.length > 0)
      params = params.append('campsiteTypes', campParams.campsiteTypes.join(','));

    params = params.append('pageNumber', campParams.pageNumber);
    params = params.append('pageSize', campParams.pageSize);

    return this.http.get<Pagination<Campground>>(this.baseUrl + 'campgrounds', {params});
  }

  getCampground(id: number) {
    return this.http.get<Campground>(this.baseUrl + 'campgrounds/' + id);
  }
}
