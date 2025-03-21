import {Campsite} from './campsite';

export type Campground = {
  id: number;
  name: string;
  description: string;
  pictureUrl: string;
  hasHiking: boolean;
  hasSwimming: boolean;
  hasCabins: boolean;
  hasFishing: boolean;
  hasBoatRentals: boolean;
  hasStore: boolean;
  hasShowers: boolean;
  hasWifi: boolean;
  allowsPets: boolean;
  campsites: Campsite[];
}
