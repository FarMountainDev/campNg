export interface Order {
  id: number
  orderDate: string
  buyerEmail: string
  paymentSummary: PaymentSummary
  orderItems: OrderItem[]
  subtotal: number
  total: number
  status: string
  paymentIntentId: string
}

export interface PaymentSummary {
  last4: number
  brand: string
  expMonth: number
  expYear: number
}

export interface OrderItem {
  campsiteId: number
  campsiteName: string
  campsiteType: string
  campgroundName: string
  startDate: string
  endDate: string
  price: number
}

export interface OrderToCreate {
  cartId: string;
  paymentSummary: PaymentSummary;
}
