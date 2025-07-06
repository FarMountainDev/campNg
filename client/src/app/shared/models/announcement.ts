import {User} from './user';
import {Campground} from './campground';

export type Announcement = {
  id: number
  title: string
  subtitle: any
  content: string
  createdAt: Date
  updatedAt: Date
  expirationDate: Date
  messageType: number
  pinnedPriority: number
  createdBy: User
  updatedBy: User
  campgrounds: Campground[]
}
