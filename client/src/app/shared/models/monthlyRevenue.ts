export interface MonthlyRevenue {
  months: string[]
  datasets: Dataset[]
}

export interface Dataset {
  campground: string
  revenue: number[]
}
