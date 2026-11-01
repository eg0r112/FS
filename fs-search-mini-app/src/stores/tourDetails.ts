import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TourOffer, RoomOption, MealOption, GetByHotelsRequest, FullHotel } from '@/types/tour-details'
import type { HotelDetails } from '@/types/hotel-details'

export const useTourDetailsStore = defineStore('tourDetails', () => {
  // State
  const offers = ref<TourOffer[]>([])
  const rooms = ref<RoomOption[]>([])
  const meals = ref<MealOption[]>([])
  const fullHotel = ref<FullHotel | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedOffer = ref<TourOffer | null>(null)

  // Hotel info (from previous page)
  const hotelInfo = ref({
    id: '',
    name: '',
    location: '',
    stars: 5
  })

  // Hotel details from API
  const hotelDetails = ref<HotelDetails | null>(null)
  const hotelDetailsLoading = ref(false)
  const hotelDetailsError = ref<string | null>(null)

  // Actions
  async function fetchTourDetails(hotelId: string | number, searchParams: Omit<GetByHotelsRequest, 'hotelIds'>) {
    loading.value = true
    error.value = null

    try {
      const { getTourOffersByHotels } = await import('@/api/tour-details')
      
      const hotelIdNum = typeof hotelId === 'string' ? parseInt(hotelId, 10) : hotelId
      
      const response = await getTourOffersByHotels({
        hotelIds: [hotelIdNum],
        ...searchParams
      })

      // Extract unique rooms, meals and fullHotel
      rooms.value = response.rooms || []
      meals.value = response.meals || []
      offers.value = response.offers || []
      
      // Сохраняем fullHotel только если он пришёл в ответе как объект (не пустой массив)
      // Если fullHotel уже есть и новый не пришёл - оставляем старый
      const newFullHotel = response.fullHotel
      const isValidFullHotel = newFullHotel && 
        !Array.isArray(newFullHotel) && 
        typeof newFullHotel === 'object' &&
        'localizedName' in newFullHotel &&
        newFullHotel.localizedName
      
      if (isValidFullHotel) {
        fullHotel.value = newFullHotel as FullHotel
        console.log('🏨 fullHotel загружен:', fullHotel.value?.localizedName)
      } else if (fullHotel.value) {
        console.log('🏨 fullHotel сохранён из предыдущего запроса:', fullHotel.value?.localizedName)
      }
      
      // Не показываем ошибку если нет офферов - просто пустой список
      // error.value остаётся null, показываем пустое состояние в UI
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Не удалось загрузить предложения'
      console.error('Failed to fetch tour details:', e)
      // При ошибке сбрасываем только offers, fullHotel сохраняем
      offers.value = []
    } finally {
      loading.value = false
    }
  }

  function setHotelInfo(info: { id: string; name: string; location: string; stars?: number }) {
    hotelInfo.value = {
      id: info.id,
      name: info.name,
      location: info.location,
      stars: info.stars || 5
    }
  }

  function selectOffer(offer: TourOffer) {
    selectedOffer.value = offer
  }

  function clearOffers() {
    offers.value = []
    rooms.value = []
    meals.value = []
    fullHotel.value = null
    selectedOffer.value = null
    error.value = null
  }

  async function fetchHotelDetails(_urlFriendlyName: string) {
    hotelDetailsLoading.value = true
    hotelDetailsError.value = null

    try {
      // Используем моки вместо реального запроса к geo API
      console.log('🔧 Используются моки для hotelDetails')
      const { mockHotelDetails } = await import('@/mocks/hotel-details')
      
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 300))
      
      hotelDetails.value = mockHotelDetails
    } catch (e) {
      hotelDetailsError.value = e instanceof Error ? e.message : 'Не удалось загрузить информацию об отеле'
      console.error('Failed to fetch hotel details:', e)
    } finally {
      hotelDetailsLoading.value = false
    }
  }

  function $reset() {
    offers.value = []
    rooms.value = []
    meals.value = []
    fullHotel.value = null
    loading.value = false
    error.value = null
    selectedOffer.value = null
    hotelInfo.value = {
      id: '',
      name: '',
      location: '',
      stars: 5
    }
    hotelDetails.value = null
    hotelDetailsLoading.value = false
    hotelDetailsError.value = null
  }

  return {
    // State
    offers,
    rooms,
    meals,
    fullHotel,
    loading,
    error,
    selectedOffer,
    hotelInfo,
    hotelDetails,
    hotelDetailsLoading,
    hotelDetailsError,
    
    // Actions
    fetchTourDetails,
    setHotelInfo,
    selectOffer,
    clearOffers,
    fetchHotelDetails,
    $reset
  }
})

