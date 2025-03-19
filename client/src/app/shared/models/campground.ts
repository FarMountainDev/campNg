import {Campsite} from './campsite';

export type Campground = {
  id: number;
  name: string;
  description: string;
  campsites: Campsite[];
}
