export type BusinessType = 'barberia' | 'peluqueria' | 'grooming' | 'otro'

export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6

export interface OwnerAccount {
  name: string
  email: string
  password: string
}

export interface BusinessInfo {
  tradeName: string
  legalName: string
  slug: string
  businessType: BusinessType
  description: string
}

export interface LocationInfo {
  city: string
  neighborhood: string
  address: string
  whatsapp: string
  email: string
}

export interface ScheduleRange {
  days: string
  open: string
  close: string
  active: boolean
}

export interface ServiceItem {
  id: string
  name: string
  description: string
  duration: string
  price: number
  selected: boolean
}

export interface ScheduleInfo {
  schedules: ScheduleRange[]
  services: ServiceItem[]
}

export interface BrandingInfo {
  primaryColor: string
  colorPreset: string
  logoUrl: string
  instagram: string
  tiktok: string
}

export interface OnboardingSubmitData {
  account: { name: string; email: string; password: string }
  business: { tradeName: string; legalName: string; slug: string; businessType: string; description: string }
  location: { city: string; neighborhood: string; address: string; whatsapp: string; email: string }
  schedule: { schedules: { days: string; open: string; close: string; active: boolean }[]; services: { id: string; name: string; description: string; duration: string; price: number; selected: boolean }[] }
  branding: { primaryColor: string; colorPreset: string; logoUrl: string; instagram: string; tiktok: string }
}

export interface OnboardingSummary {
  businessName: string
  legalName: string
  slug: string
  businessType: string
  currency: string
  timezone: string
  servicesCount: number
  channels: string
}

export interface OnboardingState {
  currentStep: OnboardingStep
  business: BusinessInfo
  location: LocationInfo
  schedule: ScheduleInfo
  branding: BrandingInfo
  summary: OnboardingSummary | null
  loading: boolean
  submitting: boolean
  completed: boolean
}
