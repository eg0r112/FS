import { defineStore } from 'pinia'
import { ref } from 'vue'
import { format } from 'date-fns'

export interface TourSearchParams {
  departureCityId: string
  departureDate: string
  nights: number
  adults: number
  childrenAges: string[] // Массив возрастов детей ["3", "7", "12"]
}

export interface AvailableDate {
  date: string
  minPrice: number
  available: boolean
}

export const useTourSearchStore = defineStore('tourSearch', () => {
  // Search parameters
  const searchParams = ref<TourSearchParams>({
    departureCityId: '1',
    departureDate: format(new Date(), 'yyyy-MM-dd'),
    nights: 7,
    adults: 2,
    childrenAges: []
  })

  // Available dates for current search
  const availableDates = ref<AvailableDate[]>([])

  // Loading state
  const isSearching = ref(false)

  // Update search parameters
  const updateSearchParams = (params: Partial<TourSearchParams>) => {
    searchParams.value = {
      ...searchParams.value,
      ...params
    }
  }

  // Set available dates
  const setAvailableDates = (dates: AvailableDate[]) => {
    availableDates.value = dates
  }

  function $reset() {
    searchParams.value = {
      departureCityId: '1',
      departureDate: format(new Date(), 'yyyy-MM-dd'),
      nights: 7,
      adults: 2,
      childrenAges: []
    }
    availableDates.value = []
    isSearching.value = false
  }

  return {
    // State
    searchParams,
    availableDates,
    isSearching,
    
    // Actions
    updateSearchParams,
    setAvailableDates,
    $reset
  }
})

