export type Money = {
  amount: string
  currency: string
}

export type DateRange = {
  startsAt: Date
  endsAt: Date
}

export type Address = {
  street?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
}

export type ContactInfo = {
  phone?: string
  email?: string
}
