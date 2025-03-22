import {inject, Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {CampsiteType} from '../../shared/models/campsiteType';

@Injectable({
  providedIn: 'root'
})
export class CampsiteTypeService {
  private readonly baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  campsiteTypes: CampsiteType[] = [];

  getCampsiteTypes() {
    if (this.campsiteTypes.length > 0) return ;
    return this.http.get<CampsiteType[]>(this.baseUrl + 'campsiteTypes').subscribe({
      next: response => this.campsiteTypes = response
    });
  }
}
