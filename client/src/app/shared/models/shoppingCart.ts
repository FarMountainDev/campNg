import {nanoid} from 'nanoid';

export type Cart = {
  id: string;
  items: CartItem[];
  deliveryMethodId?: number;
  paymentIntentId?: string;
  clientSecret?: string;
}

export type CartItem = {
  campsiteId: number;
  campsiteName: string;
  campsiteType: string;
  campgroundName: string;
  startDate: Date;
  endDate: Date;
  price: number;
}

export class ShoppingCart implements Cart {
  id = nanoid();
  items: CartItem[] = [];
  deliveryMethodId?: number;
  paymentIntentId?: string;
  clientSecret?: string;
}
