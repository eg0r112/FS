import { mockArrival, mockCheckins, mockDepartureCities, mockNights } from './mockStore'

// Типы для API ответов
export interface DepartureCity {
  id: string
  ebgNodeId: number
  localizedName: string
  countryEbgNodeId: number
  countryLocalizedName: string
}

export interface ArrivalRegion {
  ebgNodeId: number
  localizedName: string
}

export interface ArrivalCountry {
  id: string
  ebgNodeId: number
  localizedName: string
  priorityTours: number
  priorityHotels: number
  priorityExcursionTour: number
  urlName: string
  isVisaRequired: boolean
  openTours: boolean
  openHotels: boolean
  flightType: {
    id: number
    name: string
    localizedName: string
  }
  regions: ArrivalRegion[]
}

export interface ArrivalResponse {
  countries: ArrivalCountry[]
  regions: any[]
  cities: any[]
  hotels: any[]
}

export interface CheckinDay {
  checkin: string
  classes: any[]
  dayOfTheWeek: number
  isCharter: boolean
  isRegular: boolean
  isReservation: boolean
  iso: string
  number: number
  pastDay: boolean
  year: string
  month: string
  is_nullable: boolean
}

export interface CheckinMonth {
  year: string
  month: string
  first_date: string
  days: CheckinDay[]
}

export interface NightOption {
  night: number
  selected: boolean
  disabled: boolean
}

/**
 * Получить список городов отправления
 */
export async function getDepartureCities(): Promise<DepartureCity[]> {
  // Fun&Sun API мёртв — моки, чтобы Mini App работал в Telegram / GitHub Pages
  // const { data } = await apiClient.get<DepartureCity[]>('/api/v1/ru/fields/get-departure-cities')
  return mockDepartureCities()
}

/**
 * Получить список мест прибытия
 */
export async function getArrival(
  _departureCityId: number,
  _whoRequest: string = 'tours',
  arrivalPlaceName?: string,
  _tourType?: number,
  _onlyWithWeekendTours?: boolean,
  _excludeExcursionsFromHotels?: boolean
): Promise<ArrivalResponse> {
  // const { data } = await apiClient.get<ArrivalResponse>(`/api/v1/ru/fields/get-arrival?...`)
  return mockArrival(arrivalPlaceName)
}

/**
 * Получить доступные даты заезда
 */
export async function getAvailableCheckins(
  _arrivalCountryId: number,
  _departureCityId: number,
  _adultsCount: number,
  _isResirvation?: boolean,
  _hotelIds?: string,
  _tourType?: number,
  _regionIds?: string,
  _arrivalCityIds?: string,
  _isEmpty?: boolean
): Promise<CheckinMonth[]> {
  // const { data } = await apiClient.get<CheckinMonth[]>(`/api/v1/ru/fields/get-available-checkins?...`)
  return mockCheckins()
}

/**
 * Получить количество ночей по типу перевозки
 */
export async function getNightsByFreightType(
  _departureCityId: number,
  _arrivalCountryId: number,
  _adult: number,
  _checkinBeg: string,
  _checkinEnd: string,
  _child: number,
  _freightType: number,
  _regions?: string,
  _tours?: string,
  _tourType?: number
): Promise<NightOption[]> {
  // const { data } = await apiClient.get<NightOption[]>(`/api/v1/ru/fields/get-nights-by-freight-type?...`)
  return mockNights()
}

