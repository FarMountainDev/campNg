import {inject, Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {CampParams} from '../../shared/models/params/campParams';
import {Pagination} from '../../shared/models/pagination';
import {CampsiteAvailabilityDto} from '../../shared/models/campsiteAvailabilityDto';

@Injectable({
  providedIn: 'root'
})
export class CampsiteService {
  private readonly baseUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  getAvailableCampsites(startDate: Date, endDate: Date, campParams: CampParams) {
    let params = new HttpParams();

    params = params.append('startDate', this.formatDateToYYYYMMDD(startDate));
    params = params.append('endDate', this.formatDateToYYYYMMDD(endDate));

    console.log(this.formatDateToYYYYMMDD(startDate));
    console.log(this.formatDateToYYYYMMDD(endDate));

    if (campParams.campgroundAmenities.length > 0)
      params = params.append('campgroundAmenities', campParams.campgroundAmenities.join(','));

    if (campParams.campsiteTypes.length > 0)
      params = params.append('campsiteTypes', campParams.campsiteTypes.join(','));

    params = params.append('pageNumber', campParams.pageNumber);
    params = params.append('pageSize', campParams.pageSize);

    return this.http.get<Pagination<CampsiteAvailabilityDto>>(this.baseUrl + 'campsites/available', {params});
  }

  private formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
