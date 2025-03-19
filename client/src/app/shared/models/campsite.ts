import {Campground} from './campground';
import {CampsiteType} from './campsiteType';

export type Campsite = {
  id: number;
  name: string;
  description: string;
  campgroundId: number;
  campground: Campground;
  campsiteTypeId: number;
  campsiteType: CampsiteType;
}
