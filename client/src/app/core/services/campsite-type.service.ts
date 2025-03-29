import {inject, Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {CampsiteType} from '../../shared/models/campsiteType';
import {Observable, shareReplay} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CampsiteTypeService {
  private readonly baseUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);
  private campsiteTypes$: Observable<CampsiteType[]> | null = null;

  getCampsiteTypes(): Observable<CampsiteType[]> {
    if (!this.campsiteTypes$) {
      this.campsiteTypes$ = this.http.get<CampsiteType[]>(
        this.baseUrl + 'campsiteTypes'
      ).pipe(
        shareReplay(1)
      );
    }
    return this.campsiteTypes$;
  }
}
