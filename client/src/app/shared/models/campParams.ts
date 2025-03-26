import {PaginationParams} from './paginationParams';

export class CampParams implements PaginationParams {
  pageNumber = 1;
  pageSize = 10;
  sort = 'name';
  search = '';
  campgroundAmenities: number[] = [];
  campsiteTypes: number[] = [];
}
