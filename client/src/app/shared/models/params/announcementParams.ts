import { PaginationParams } from './paginationParams';

export class AnnouncementParams extends PaginationParams {
  campgrounds: number[] | null = null;
}
