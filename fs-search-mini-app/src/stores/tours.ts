import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { format, parseISO, isValid } from 'date-fns'
import type { Tour, ApiResponse } from '@/types'
import { searchTours } from '@/api/tours'
import { useSearchStore } from './search'
import { useFiltersStore } from './filters'

export const useToursStore = defineStore('tours', () => {
  // State
  const tours = ref<Tour[]>([])
  const filters = ref<ApiResponse['filters'] | null>(null)
  const other = ref<ApiResponse['other'] | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentTour = ref<Tour | null>(null)
  const sort = ref<string>('recommendations_FS') // По умолчанию FUN&SUN рекомендует

  // Getters
  const toursCount = computed(() => tours.value.length)
  const hasTours = computed(() => tours.value.length > 0)

  // Actions
  async function fetchTours(searchParams: {
    from?: string | number
    to?: string | number
    date?: string
    nights?: string | number
    adults?: string | number
    children?: string | number
  }) {
    loading.value = true
    error.value = null

    try {
      const searchStore = useSearchStore()
      
      // Преобразуем параметры в формат API
      const departureCityId = searchStore.searchParams.fromId || parseInt(searchParams.from?.toString() || '274286')
      const arrivalCountryId = searchStore.searchParams.toId || parseInt(searchParams.to?.toString() || '18803')
      
      // Нормализуем даты к формату YYYY-MM-DD
      const normalizeDate = (dateStr: string | undefined): string => {
        if (!dateStr) return format(new Date(), 'yyyy-MM-dd')
        
        // Если дата уже в формате YYYY-MM-DD, возвращаем как есть
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          return dateStr
        }
        
        // Пытаемся распарсить ISO дату и преобразовать в YYYY-MM-DD
        try {
          const parsed = parseISO(dateStr)
          if (isValid(parsed)) {
            return format(parsed, 'yyyy-MM-dd')
          }
        } catch (e) {
          console.warn('Failed to parse date:', dateStr, e)
        }
        
        // Если не удалось распарсить, возвращаем текущую дату
        return format(new Date(), 'yyyy-MM-dd')
      }
      
      const rawDate = searchParams.date || searchStore.searchParams.date || format(new Date(), 'yyyy-MM-dd')
      const rawEndDate = searchStore.searchParams.endDate
      
      const date = normalizeDate(rawDate)
      const endDate = rawEndDate ? normalizeDate(rawEndDate) : undefined
      
      const nights = parseInt(searchParams.nights?.toString() || searchStore.searchParams.nights?.toString() || '7')
      const adults = parseInt(searchParams.adults?.toString() || searchStore.searchParams.adults?.toString() || '2')
      
      // Берём возрасты детей из store (массив строк)
      const storeChildrenAges = searchStore.searchParams.childrenAges || []
      const childrenAges: string[] | undefined = storeChildrenAges.length > 0 
        ? storeChildrenAges 
        : undefined

      const apiParams = {
        departureCityId,
        arrivalCountryId,
        minStartDate: date,
        maxStartDate: endDate || date, // Используем конечную дату, если указана, иначе начальную
        minNightsCount: nights,
        maxNightsCount: nights,
        adults,
        flightTypes: 'all' as const,
        sort: sort.value
      }

      // Получаем фильтры из filters store
      const filtersStore = useFiltersStore()
      const tourFilters = filtersStore.getFiltersForApi
      
      const response = await searchTours(apiParams, childrenAges, tourFilters)
      
      tours.value = response.tours || []
      filters.value = response.filters
      other.value = response.other
      
      // Обновляем фильтры в filters store из ответа API
      if (response.filters) {
        filtersStore.apiFilters = response.filters
        // Обновляем диапазон цен из API
        if (response.filters.price?.data?.length === 2) {
          const newMin = response.filters.price.data[0].id
          const newMax = response.filters.price.data[1].id
          
          const currentMin = filtersStore.activeFilters.priceRange[0]
          const currentMax = filtersStore.activeFilters.priceRange[1]
          
          // Обновляем границы диапазона (не триггерит watch)
          filtersStore.priceRange = {
            min: newMin,
            max: newMax
          }
          
          // Обновляем activeFilters.priceRange ТОЛЬКО при первой загрузке (дефолтные значения)
          // После этого пользователь сам управляет диапазоном
          const isDefaultValues = currentMin === 55855 && currentMax === 1275874
          if (isDefaultValues) {
            filtersStore.activeFilters.priceRange = [newMin, newMax]
          }
          // НЕ корректируем значения пользователя - это вызывает цикл запросов
        }
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка загрузки туров'
      console.error('Failed to fetch tours:', e)
      
      // Не используем моки при ошибке - просто показываем пустой список
    } finally {
      loading.value = false
    }
  }

  function setCurrentTour(tour: Tour | null) {
    currentTour.value = tour
  }

  function clearTours() {
    tours.value = []
    currentTour.value = null
    error.value = null
  }

  function setSort(newSort: string) {
    sort.value = newSort
  }

  function $reset() {
    tours.value = []
    filters.value = null
    other.value = null
    loading.value = false
    error.value = null
    currentTour.value = null
    sort.value = 'recommendations_FS'
  }

  return {
    // State
    tours,
    filters,
    other,
    loading,
    error,
    currentTour,
    sort,
    
    // Getters
    toursCount,
    hasTours,
    
    // Actions
    fetchTours,
    setCurrentTour,
    clearTours,
    setSort,
    $reset
  }
})

