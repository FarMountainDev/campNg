import {inject, Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {CampgroundAmenity} from '../../shared/models/campgroundAmenity';

@Injectable({
  providedIn: 'root'
})
export class CampgroundAmenityService {
  private readonly baseUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);
  campgroundAmenities: CampgroundAmenity[] = [];

  getCampgroundAmenities() {
    if (this.campgroundAmenities.length > 0) return ;
    return this.http.get<CampgroundAmenity[]>(this.baseUrl + 'campgroundAmenities').subscribe({
      next: response => this.campgroundAmenities = response
    });
  }
}
