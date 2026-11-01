import type { GetByHotelsRequest, GetByHotelsResponse } from '@/types/tour-details'
import { mockHotelOffers } from './mockStore'

export async function getTourOffersByHotels(params: GetByHotelsRequest): Promise<GetByHotelsResponse> {
  console.log('📡 API GetByHotels вызван с параметрами:', {
    hotelIds: params.hotelIds,
    departureCityId: params.departureCityId,
    minStartDate: params.minStartDate,
    maxStartDate: params.maxStartDate,
    nightsFrom: params.nightsFrom,
    nightsTo: params.nightsTo,
    adults: params.adults,
    children: params.children
  })

  // Fun&Sun API недоступен — моки
  // const response = await fetch('https://service-api.fstravel.com/api/v1/ru/search/get-for-crm-advice-hotels', { ... })
  return mockHotelOffers(params)
}

