import type { SearchParams, ApiResponse } from '@/types'
import { mockObjectByUrlName, mockSearchTours } from './mockStore'

export interface TourFilters {
  mealTypes?: (string | number)[]
  stars?: (string | number)[]
  topHotels?: number
  placementTypes?: (string | number)[]
  tourTypes?: (string | number)[]
  distanceSea?: (string | number)[]
  beach?: (string | number)[]
  funSunHotels?: (string | number)[]
  locations?: (string | number)[]
  hotelTypes?: (string | number)[]
  forKids?: (string | number)[]
  waterActivities?: (string | number)[]
  additionally?: (string | number)[]
  placementFeatures?: (string | number)[]
  priceMin?: number
  priceMax?: number
  hotelName?: string
  isInstantConfirmation?: boolean
  arrivalCityIds?: string
  arrivalRegionIds?: string
}

/**
 * Поиск туров по стране
 */
export const searchTours = async (
  params: SearchParams,
  childrenAges?: string[],
  filters?: TourFilters
): Promise<ApiResponse> => {
  try {
    const requestParams: Record<string, string | number | boolean> = {
      departureCityId: params.departureCityId.toString(),
      arrivalCountryId: params.arrivalCountryId.toString(),
      minStartDate: params.minStartDate,
      maxStartDate: params.maxStartDate,
      minNightsCount: params.minNightsCount.toString(),
      maxNightsCount: params.maxNightsCount.toString(),
      adults: params.adults.toString(),
      flightTypes: params.flightTypes,
      sort: params.sort
    }

    // Добавляем children если передан массив возрастов
    // Формат: "4,6" - возрасты детей через запятую
    if (childrenAges && childrenAges.length > 0) {
      requestParams.children = childrenAges.join(',')
    }

    // Добавляем параметры фильтров
    if (filters) {
      if (filters.mealTypes && filters.mealTypes.length > 0) {
        requestParams.mealTypes = filters.mealTypes.join(',')
      }
      
      if (filters.stars && filters.stars.length > 0) {
        requestParams.stars = filters.stars.join(',')
      }
      
      if (filters.topHotels !== undefined) {
        requestParams.topHotels = filters.topHotels
      }
      
      if (filters.placementTypes && filters.placementTypes.length > 0) {
        requestParams.placementTypes = filters.placementTypes.join(',')
      }
      
      if (filters.tourTypes && filters.tourTypes.length > 0) {
        requestParams.tourTypes = filters.tourTypes.join(',')
      }
      
      if (filters.distanceSea && filters.distanceSea.length > 0) {
        requestParams.distanceSea = filters.distanceSea.join(',')
      }
      
      if (filters.beach && filters.beach.length > 0) {
        requestParams.beach = filters.beach.join(',')
      }
      
      if (filters.funSunHotels && filters.funSunHotels.length > 0) {
        requestParams.funSunHotels = filters.funSunHotels.join(',')
      }
      
      if (filters.locations && filters.locations.length > 0) {
        requestParams.locations = filters.locations.join(',')
      }
      
      if (filters.hotelTypes && filters.hotelTypes.length > 0) {
        requestParams.hotelTypes = filters.hotelTypes.join(',')
      }
      
      if (filters.forKids && filters.forKids.length > 0) {
        requestParams.forKids = filters.forKids.join(',')
      }
      
      if (filters.waterActivities && filters.waterActivities.length > 0) {
        requestParams.waterActivities = filters.waterActivities.join(',')
      }
      
      if (filters.additionally && filters.additionally.length > 0) {
        requestParams.additionally = filters.additionally.join(',')
      }
      
      if (filters.placementFeatures && filters.placementFeatures.length > 0) {
        requestParams.placementFeatures = filters.placementFeatures.join(',')
      }
      
      if (filters.priceMin !== undefined) {
        requestParams.priceMin = filters.priceMin
      }
      
      if (filters.priceMax !== undefined) {
        requestParams.priceMax = filters.priceMax
      }
      
      if (filters.hotelName) {
        requestParams.hotelName = filters.hotelName
      }
      
      if (filters.isInstantConfirmation !== undefined) {
        requestParams.isInstantConfirmation = filters.isInstantConfirmation
      }
      
      if (filters.arrivalCityIds) {
        requestParams.arrivalCityIds = filters.arrivalCityIds
      }
      
      if (filters.arrivalRegionIds) {
        requestParams.arrivalRegionIds = filters.arrivalRegionIds
      }
    }

    // const { data } = await apiClient.get<ApiResponse>('/api/v1/ru/search/get-by-country', { params: requestParams })
    return mockSearchTours(params, filters)
  } catch (error) {
    console.error('Failed to search tours:', error)
    throw error
  }
}

/**
 * Получение объекта по URL имени (детали отеля/тура)
 */
export const getObjectByUrlName = async (
  urlName: string,
  _isFull: boolean = true
) => {
  try {
    // const { data } = await apiClient.get('/api/v1/ru/geo/get-object-by-urlname', { params: { urlName, isFull: isFull.toString() } })
    return mockObjectByUrlName(urlName)
  } catch (error) {
    console.error('Failed to get object by url name:', error)
    throw error
  }
}

// Эти функции теперь в fields.ts - getDepartureCities и getArrival
// Оставлены для обратной совместимости, но рекомендуется использовать fields.ts

