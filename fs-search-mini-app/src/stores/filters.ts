import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Filters } from '@/types'

interface FilterState {
  priceRange: number[]
  stars: (string | number)[]
  meals: (string | number)[]
  hotelName: string
  isInstantConfirmation: boolean
  topHotels: number | undefined
  popularTypes: (string | number)[]
  regions: (string | number)[]
  placementTypes: (string | number)[]
  tourTypes: (string | number)[]
  distanceSea: (string | number)[]
  beach: (string | number)[]
  funSunHotels: (string | number)[]
  locations: (string | number)[]
  hotelTypes: (string | number)[]
  forKids: (string | number)[]
  waterActivities: (string | number)[]
  additionally: (string | number)[]
  placementFeatures: (string | number)[]
  arrivalCityIds?: string
  arrivalRegionIds?: string
}

export const useFiltersStore = defineStore('filters', () => {
  // State
  const apiFilters = ref<Filters | null>(null)
  const priceRange = ref({ min: 55855, max: 1275874 })
  
  const activeFilters = ref<FilterState>({
    priceRange: [55855, 1275874],
    stars: [],
    meals: [],
    hotelName: '',
    isInstantConfirmation: false,
    topHotels: undefined,
    popularTypes: [],
    regions: [],
    placementTypes: [],
    tourTypes: [],
    distanceSea: [],
    beach: [],
    funSunHotels: [],
    locations: [],
    hotelTypes: [],
    forKids: [],
    waterActivities: [],
    additionally: [],
    placementFeatures: [],
    arrivalCityIds: undefined,
    arrivalRegionIds: undefined
  })

  // Getters
  const activeFiltersCount = computed(() => {
    let count = 0
    
    if (activeFilters.value.priceRange[0] !== priceRange.value.min || 
        activeFilters.value.priceRange[1] !== priceRange.value.max) {
      count++
    }
    
    if (activeFilters.value.stars.length > 0) count++
    if (activeFilters.value.meals.length > 0) count++
    if (activeFilters.value.hotelName) count++
    if (activeFilters.value.isInstantConfirmation) count++
    if (activeFilters.value.topHotels !== undefined) count++
    if (activeFilters.value.popularTypes.length > 0) count++
    if (activeFilters.value.regions.length > 0) count++
    if (activeFilters.value.placementTypes.length > 0) count++
    if (activeFilters.value.tourTypes.length > 0) count++
    if (activeFilters.value.distanceSea.length > 0) count++
    if (activeFilters.value.beach.length > 0) count++
    if (activeFilters.value.funSunHotels.length > 0) count++
    if (activeFilters.value.locations.length > 0) count++
    if (activeFilters.value.hotelTypes.length > 0) count++
    if (activeFilters.value.forKids.length > 0) count++
    if (activeFilters.value.waterActivities.length > 0) count++
    if (activeFilters.value.additionally.length > 0) count++
    if (activeFilters.value.placementFeatures.length > 0) count++
    if (activeFilters.value.arrivalCityIds) count++
    if (activeFilters.value.arrivalRegionIds) count++
    
    return count
  })

  // Преобразует фильтры из store в формат для API
  const getFiltersForApi = computed(() => {
    const filters: import('@/api/tours').TourFilters = {}
    
    if (activeFilters.value.meals.length > 0) {
      filters.mealTypes = activeFilters.value.meals
    }
    
    if (activeFilters.value.stars.length > 0) {
      filters.stars = activeFilters.value.stars
    }
    
    if (activeFilters.value.topHotels !== undefined) {
      filters.topHotels = activeFilters.value.topHotels
    }
    
    if (activeFilters.value.placementTypes.length > 0) {
      filters.placementTypes = activeFilters.value.placementTypes
    }
    
    if (activeFilters.value.tourTypes.length > 0) {
      filters.tourTypes = activeFilters.value.tourTypes
    }
    
    if (activeFilters.value.distanceSea.length > 0) {
      filters.distanceSea = activeFilters.value.distanceSea
    }
    
    if (activeFilters.value.beach.length > 0) {
      filters.beach = activeFilters.value.beach
    }
    
    if (activeFilters.value.funSunHotels.length > 0) {
      filters.funSunHotels = activeFilters.value.funSunHotels
    }
    
    if (activeFilters.value.locations.length > 0) {
      filters.locations = activeFilters.value.locations
    }
    
    if (activeFilters.value.hotelTypes.length > 0) {
      filters.hotelTypes = activeFilters.value.hotelTypes
    }
    
    if (activeFilters.value.forKids.length > 0) {
      filters.forKids = activeFilters.value.forKids
    }
    
    if (activeFilters.value.waterActivities.length > 0) {
      filters.waterActivities = activeFilters.value.waterActivities
    }
    
    if (activeFilters.value.additionally.length > 0) {
      filters.additionally = activeFilters.value.additionally
    }
    
    if (activeFilters.value.placementFeatures.length > 0) {
      filters.placementFeatures = activeFilters.value.placementFeatures
    }
    
    // Обрабатываем популярные фильтры - они могут иметь разные paramName
    // Нужно распределить их по соответствующим полям
    activeFilters.value.popularTypes.forEach(id => {
      // Найдем фильтр в apiFilters, чтобы узнать его paramName
      const popularFilter = apiFilters.value?.popularTypes?.data?.find((f: any) => f.id === id)
      if (popularFilter?.paramName) {
        const paramName = popularFilter.paramName
        if (paramName === 'mealTypes') {
          if (!filters.mealTypes) filters.mealTypes = []
          filters.mealTypes = [...filters.mealTypes, id]
        } else if (paramName === 'additionally') {
          if (!filters.additionally) filters.additionally = []
          filters.additionally = [...filters.additionally, id]
        } else if (paramName === 'distanceSea') {
          if (!filters.distanceSea) filters.distanceSea = []
          filters.distanceSea = [...filters.distanceSea, id]
        } else if (paramName === 'tourTypes') {
          if (!filters.tourTypes) filters.tourTypes = []
          filters.tourTypes = [...filters.tourTypes, id]
        } else if (paramName === 'flightTypes') {
          // flightTypes уже обрабатывается отдельно в запросе
        } else if (paramName === 'topHotels' && filters.topHotels === undefined) {
          filters.topHotels = typeof id === 'number' ? id : Number(id)
        }
      }
    })
    
    // Цена
    if (activeFilters.value.priceRange[0] !== priceRange.value.min || 
        activeFilters.value.priceRange[1] !== priceRange.value.max) {
      filters.priceMin = activeFilters.value.priceRange[0]
      filters.priceMax = activeFilters.value.priceRange[1]
    }
    
    // Название отеля
    if (activeFilters.value.hotelName) {
      filters.hotelName = activeFilters.value.hotelName
    }
    
    // Мгновенное подтверждение
    if (activeFilters.value.isInstantConfirmation) {
      filters.isInstantConfirmation = true
    }
    
    // Регионы и курорты
    // Нужно преобразовать UUID в ebgNodeId
    if (activeFilters.value.regions.length > 0) {
      const regionIds: number[] = []
      const cityIds: number[] = []
      
      // Проходим по всем выбранным регионам и городам
      activeFilters.value.regions.forEach((regionId: string | number) => {
        // Ищем регион в apiFilters
        const findInRegions = (regions: any[]): { ebgNodeId?: number, isCity?: boolean } | null => {
          for (const region of regions) {
            // Проверяем сам регион
            if (region.id === regionId) {
              return { ebgNodeId: region.ebgNodeId, isCity: false }
            }
            // Проверяем города внутри региона
            if (region.children && Array.isArray(region.children)) {
              for (const city of region.children) {
                if (city.id === regionId) {
                  return { ebgNodeId: city.ebgNodeId, isCity: true }
                }
              }
            }
          }
          return null
        }
        
        const found = apiFilters.value?.regionsAndResorts?.data 
          ? findInRegions(apiFilters.value.regionsAndResorts.data)
          : null
        
        if (found?.ebgNodeId) {
          if (found.isCity) {
            cityIds.push(found.ebgNodeId)
          } else {
            regionIds.push(found.ebgNodeId)
          }
        }
      })
      
      // Передаем ebgNodeId вместо UUID
      if (regionIds.length > 0) {
        filters.arrivalRegionIds = regionIds.join(',')
      }
      if (cityIds.length > 0) {
        filters.arrivalCityIds = cityIds.join(',')
      }
    }
    
    if (activeFilters.value.arrivalCityIds) {
      filters.arrivalCityIds = activeFilters.value.arrivalCityIds
    }
    
    if (activeFilters.value.arrivalRegionIds) {
      filters.arrivalRegionIds = activeFilters.value.arrivalRegionIds
    }
    
    return filters
  })

  const hasActiveFilters = computed(() => activeFiltersCount.value > 0)

  // Actions
  function loadFilters() {
    // Фильтры загружаются автоматически при первом запросе туров
    // Эта функция оставлена для совместимости
    // Фильтры должны приходить из API в ответе на запрос туров
  }

  function applyFilters(filters: any) {
    activeFilters.value = {
      priceRange: [filters.priceMin ?? priceRange.value.min, filters.priceMax ?? priceRange.value.max],
      stars: filters.stars || [],
      meals: filters.mealTypes || [],
      hotelName: filters.hotelName || '',
      isInstantConfirmation: filters.isInstantConfirmation || false,
      topHotels: filters.topHotels,
      popularTypes: filters.popularTypes || [],
      regions: filters.regions || [],
      placementTypes: filters.placementTypes || [],
      tourTypes: filters.tourTypes || [],
      distanceSea: filters.distanceSea || [],
      beach: filters.beach || [],
      funSunHotels: filters.funSunHotels || [],
      locations: filters.locations || [],
      hotelTypes: filters.hotelTypes || [],
      forKids: filters.forKids || [],
      waterActivities: filters.waterActivities || [],
      additionally: filters.additionally || [],
      placementFeatures: filters.placementFeatures || [],
      arrivalCityIds: filters.arrivalCityIds,
      arrivalRegionIds: filters.arrivalRegionIds
    }
  }

  function resetFilters() {
    activeFilters.value = {
      priceRange: [priceRange.value.min, priceRange.value.max],
      stars: [],
      meals: [],
      hotelName: '',
      isInstantConfirmation: false,
      topHotels: undefined,
      popularTypes: [],
      regions: [],
      placementTypes: [],
      tourTypes: [],
      distanceSea: [],
      beach: [],
      funSunHotels: [],
      locations: [],
      hotelTypes: [],
      forKids: [],
      waterActivities: [],
      additionally: [],
      placementFeatures: [],
      arrivalCityIds: undefined,
      arrivalRegionIds: undefined
    }
  }

  function $reset() {
    apiFilters.value = null
    priceRange.value = { min: 55855, max: 1275874 }
    resetFilters()
  }

  return {
    // State
    apiFilters,
    priceRange,
    activeFilters,
    
    // Getters
    activeFiltersCount,
    hasActiveFilters,
    getFiltersForApi,
    
    // Actions
    loadFilters,
    applyFilters,
    resetFilters,
    $reset
  }
})

