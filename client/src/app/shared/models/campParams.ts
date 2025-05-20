import {PaginationParams} from './paginationParams';

export class CampParams extends PaginationParams {
  campgroundAmenities: number[] = [];
  campsiteTypes: number[] = [];
}
