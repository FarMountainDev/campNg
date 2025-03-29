import {inject, Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {CampgroundAmenity} from '../../shared/models/campgroundAmenity';
import {Observable, shareReplay} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CampgroundAmenityService {
  private readonly baseUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);
  private campgroundAmenities$: Observable<CampgroundAmenity[]> | null = null;

  getCampgroundAmenities(): Observable<CampgroundAmenity[]> {
    if (!this.campgroundAmenities$) {
      this.campgroundAmenities$ = this.http.get<CampgroundAmenity[]>(
        this.baseUrl + 'campgroundAmenities'
      ).pipe(
        shareReplay(1)
      );
    }
    return this.campgroundAmenities$;
  }
}
