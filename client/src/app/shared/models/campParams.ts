import {PaginationParams} from './paginationParams';

export class CampParams implements PaginationParams {
  pageNumber = 1;
  pageSize = 10;
  sort = 'name';
  search = '';
  campsiteTypes: number[] = [];
  hasHiking: boolean | null = null;
  hasSwimming: boolean | null = null;
  hasFishing: boolean | null = null;
  hasShowers: boolean | null = null;
  hasBoatRentals: boolean | null = null;
  hasStore: boolean | null = null;
  hasWifi: boolean | null = null;
  allowsPets: boolean | null = null;
}
