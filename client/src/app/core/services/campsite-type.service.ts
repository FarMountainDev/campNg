import {inject, Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CampsiteTypeService {
  private readonly baseUrl = environment.apiUrl;
  private http = inject(HttpClient);


}
