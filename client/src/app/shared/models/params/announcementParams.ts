import { PaginationParams } from './paginationParams';

export class AnnouncementParams extends PaginationParams {
  campground: number[] = [];
  messageType: string | null = null;
}
